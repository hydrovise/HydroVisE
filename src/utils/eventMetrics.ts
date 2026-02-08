import { parse as csvParse } from 'papaparse';
import moment from 'moment';
import * as math from 'mathjs';
import { HydroVisEConfig as ConfigType, SystemState } from '../types/config';

// Constants
// const CFS_TO_CMS = 0.0283168;
const DT_FORMAT_ROUNDED = 'YYYY-MM-DD';
const DT_FORMAT_GENERAL = 'YYYY-MM-DD HH:mm';

// Metric calculation interface
export interface MetricResult {
  volume_error: number;
  agreementindex: number;
  bias: number;
  correlationcoefficient: number;
  covariance: number;
  decomposed_mse: number;
  kge: number;
  log_p: number;
  mae: number;
  mse: number;
  nashsutcliffe: number;
  pbias: number;
  rmse: number;
  rrmse: number;
  rsquared: number;
  rsr: number;
  nRMSE: number;
  nMAE: number;
  timing: number;
  norm_bias: number;
  ppd: number;
  peak_qsim: number;
  qsim_vol: number;
  qobs_vol: number;
  pt_change_vol: number;
  prod: string;
  year: number;
  [comIDName: string]: string | number;
}

export interface ComparisonData {
  obs: number;
  sim: number;
  dt: string;
}

export interface ProgressCallback {
  (progress: number): void;
}

// Utility functions
export function any(iterable: Record<string, any[]>): boolean {
  for (const strName in iterable) {
    return iterable[strName].length === 0;
  }
  return false;
}

export function unpack<T>(data: any[], key: string): T[] {
  return data.map(row => row[key] as T);
}

export function getDatetime(arr: any[], key?: string): string[] {
  if (key) {
    return arr.map(row => moment(row[key]).format(DT_FORMAT_GENERAL));
  } else {
    return arr.map(row => moment(row).format(DT_FORMAT_GENERAL));
  }
}

export function roundToDay(dt: string | string[]): string | string[] {
  if (Array.isArray(dt)) {
    return dt.map(row => moment(row).format(DT_FORMAT_ROUNDED) + ' 00:00');
  } else {
    return moment(dt).format(DT_FORMAT_ROUNDED) + ' 00:00';
  }
}

export function getValFromIndices<T>(array: T[], indices: number[]): T[] {
  return array.filter((_, index) => indices.includes(index));
}

export function arraysEqual(a1: any[], a2: any[]): boolean {
  return JSON.stringify(a1) === JSON.stringify(a2);
}

// Vector operations for metric calculations
function vecOperator(
  arr1: number[],
  arr2: number[] | number,
  operation: 'subtract' | 'sum' | 'power',
  _returnType: 'value'
): number[] {
  if (typeof arr2 === 'number') {
    switch (operation) {
      case 'subtract':
        return arr1.map(val => val - arr2);
      case 'power':
        return arr1.map(val => Math.pow(val, arr2));
      default:
        return arr1;
    }
  } else {
    switch (operation) {
      case 'subtract':
        return arr1.map((val, idx) => val - arr2[idx]);
      case 'sum':
        return arr1.map((val, idx) => val + arr2[idx]);
      default:
        return arr1;
    }
  }
}

// Trapezoidal integration
function trapzIntegral(y: number[], x: number[]): number {
  let integral = 0;
  for (let i = 1; i < y.length; i++) {
    integral += (x[i] - x[i - 1]) * (y[i] + y[i - 1]) / 2;
  }
  return integral;
}

// Cross-correlation calculation
function xcorr(sim: number[], obs: number[]): [number[], number] {
  const n = Math.min(sim.length, obs.length);
  const maxdelay = Math.floor(n / 4);
  const mx = math.mean(sim);
  const my = math.mean(obs);

  const denom = Math.sqrt(
    math.sum(sim.map(val => Math.pow(val - mx, 2))) *
    math.sum(obs.map(val => Math.pow(val - my, 2)))
  );

  const r: number[] = [];

  for (let delay = -maxdelay - 1; delay < maxdelay; delay++) {
    let sxy = 0;
    for (let i = 0; i < n; i++) {
      const j = i + delay;
      if (j < 0 || j >= n) {
        continue;
      } else {
        sxy += (sim[i] - mx) * (obs[j] - my);
      }
    }
    r[delay + maxdelay + 1] = sxy / denom;
  }

  const lag = r.indexOf(Math.max(...r)) - maxdelay + 1;
  return [r, lag];
}

// Agreement index calculation
function agreementIndex(obs: number[], sim: number[]): number {
  const diff = vecOperator(obs, sim, 'subtract', 'value');
  const deviationSim = vecOperator(sim, math.mean(obs), 'subtract', 'value');
  const deviationObs = vecOperator(obs, math.mean(obs), 'subtract', 'value');
  const devsum = vecOperator(math.abs(deviationSim), math.abs(deviationObs), 'sum', 'value');

  return 1 - (math.sum(vecOperator(diff, 2, 'power', 'value'))) /
    (math.sum(vecOperator(devsum, 2, 'power', 'value')));
}

// Member search function
function isMember(a: any[], b: any[]): [number[], number[]] {
  const aIndices: number[] = [];
  const bIndices: number[] = [];

  for (let i = 0; i < a.length; i++) {
    for (let j = 0; j < b.length; j++) {
      if (a[i] === b[j]) {
        aIndices.push(i);
        bIndices.push(j);
      }
    }
  }

  return [aIndices, bIndices];
}

// Main metrics calculation function
export function allMetrics(
  compreadyArray: Record<string, ComparisonData[]>,
  fn: string,
  _feature: any
): MetricResult {
  const subset_year = {
    obs: compreadyArray[fn].map(item => item.obs),
    sim: compreadyArray[fn].map(item => item.sim),
    dt: compreadyArray[fn].map(item => item.dt)
  };

  // Basic statistics
  const qref_mean = Number(math.mean(subset_year.obs));
  const qref_std = Number(math.std(subset_year.obs));
  const qsim_mean = Number(math.mean(subset_year.sim));
  const qsim_std = Number(math.std(subset_year.sim));

  // Volume calculations
  const qobs_vol = trapzIntegral(subset_year.obs, subset_year.dt.map((_, i) => i));
  const qsim_vol = trapzIntegral(subset_year.sim, subset_year.dt.map((_, i) => i));

  // Difference calculations
  const diff = vecOperator(subset_year.obs, subset_year.sim, 'subtract', 'value');
  const [, _lag] = xcorr(subset_year.sim, subset_year.obs);

  // Peak calculations
  const peak_qref = Number(math.max(subset_year.obs));
  const idxPeakObs = subset_year.obs.indexOf(peak_qref);
  const t_obs_pk = subset_year.dt[idxPeakObs];
  const peak_qsim = Number(math.max(subset_year.sim));
  const idxPeakSim = subset_year.sim.indexOf(peak_qsim);
  const t_sim_pk = subset_year.dt[idxPeakSim];

  // Calculate all metrics
  const agreementindex = agreementIndex(subset_year.obs, subset_year.sim);
  const bias = qsim_mean - qref_mean;
  const correlationcoefficient = math.corr ? Number(math.corr(subset_year.sim, subset_year.obs)) : 0;
  const covariance = Number(math.sum(diff.map(d => d * d))) / (diff.length - 1);

  const mse = Number(math.mean(diff.map(d => d * d)));
  const rmse = Math.sqrt(mse);
  const mae = Number(math.mean(diff.map(d => Math.abs(d))));
  const nashsutcliffe = 1 - (Number(math.sum(diff.map(d => d * d))) /
    Number(math.sum(subset_year.obs.map(val => Math.pow(val - qref_mean, 2)))));

  const pbias = (Number(math.sum(diff)) / Number(math.sum(subset_year.obs))) * 100;
  const rrmse = rmse / qref_mean;
  const rsquared = Math.pow(correlationcoefficient, 2);
  const rsr = rmse / qref_std;
  const nRMSE = rmse / (Number(math.max(subset_year.obs)) - Number(math.min(subset_year.obs)));
  const nMAE = mae / (Number(math.max(subset_year.obs)) - Number(math.min(subset_year.obs)));

  // KGE calculation
  const r = correlationcoefficient;
  const alpha = qsim_std / qref_std;
  const beta = qsim_mean / qref_mean;
  const kge = 1 - Math.sqrt(Math.pow(r - 1, 2) + Math.pow(alpha - 1, 2) + Math.pow(beta - 1, 2));

  // Timing and other advanced metrics
  const timing = moment(t_sim_pk).diff(moment(t_obs_pk), 'hours');
  const volume_error = ((qsim_vol - qobs_vol) / qobs_vol) * 100;
  const norm_bias = bias / qref_std;
  const ppd = ((peak_qsim - peak_qref) / peak_qref) * 100;
  const pt_change_vol = ((qsim_vol - qobs_vol) / qobs_vol) * 100;

  return {
    volume_error,
    agreementindex,
    bias,
    correlationcoefficient,
    covariance,
    decomposed_mse: mse,
    kge,
    log_p: Math.log(peak_qref),
    mae,
    mse,
    nashsutcliffe,
    pbias,
    rmse,
    rrmse,
    rsquared,
    rsr,
    nRMSE,
    nMAE,
    timing,
    norm_bias,
    ppd,
    peak_qsim,
    qsim_vol,
    qobs_vol,
    pt_change_vol,
    prod: '',
    year: 0
  };
}

// File list generation
export function returnFileList(comID: string, config: ConfigType, systemState: SystemState): string[] {
  const fnList: string[] = [];
  const traceKeys = Object.keys(config.traces);

  traceKeys.forEach(key => {
    const c = config.traces[key].template;
    const useValues = c.var.map(varKey =>
      varKey !== 'yr' ? comID : systemState[varKey as keyof SystemState]
    );
    const f = formatArray(c.path_format, useValues);
    fnList.push(f);
  });

  return fnList;
}

// Template formatting utility
function formatArray(template: string, values: any[]): string {
  let result = template;
  values.forEach((value, index) => {
    result = result.replace(`{${index}}`, String(value));
  });
  return result;
}

// Main event metrics calculation function
export async function calcEventMetrics(
  mapMarkers: any,
  config: ConfigType,
  systemState: SystemState,
  comIDName: string,
  onProgress?: ProgressCallback
): Promise<MetricResult[]> {
  const features = mapMarkers.features;
  const nFeatures = features.length;
  let processedFeatures = 0;
  const metricsLocal: MetricResult[] = [];

  for (const feature of features) {
    try {
      const comID = String(feature.properties[comIDName]);
      const fnList = returnFileList(comID, config, systemState);
      const dt1: Record<string, any[]> = {};

      // Load all CSV files for this feature
      const loadPromises = fnList.map(async (fn) => {
        return new Promise<void>((resolve) => {
          csvParse(fn, {
            download: true,
            header: true,
            dynamicTyping: true,
            complete: (results) => {
              dt1[fn] = results.data;
              resolve();
            }
          });
        });
      });

      await Promise.all(loadPromises);

      // Analyze the data
      const pointMetrics = analyzeData(dt1, feature, config, systemState, comIDName);
      metricsLocal.push(...pointMetrics);

      processedFeatures++;
      const progress = ((processedFeatures / nFeatures) * 100);

      if (onProgress) {
        onProgress(progress);
      }
    } catch (error) {
      console.error(`Data missing on feature comID = ${feature.properties[comIDName]}`, error);
    }
  }

  return metricsLocal;
}

// Data analysis function
function analyzeData(
  dataArr: Record<string, any[]>,
  feature: any,
  config: ConfigType,
  systemState: SystemState,
  comIDName: string
): MetricResult[] {
  const selectedRange = systemState.xRange;
  const indices: Record<string, [number[], number[]]> = {};
  const lid = String(feature.properties[comIDName]);
  const fnList = returnFileList(lid, config, systemState);

  // Find matching indices for time ranges
  fnList.forEach(f => {
    const roundedRange = roundToDay(selectedRange) as string[];
    const datetime = getDatetime(dataArr[f], 'dt');
    indices[f] = isMember(roundedRange, datetime);
  });

  const dataArray: Record<string, any[]> = {};
  const comparisonArray: Record<string, [any[], any[]]> = {};

  // Take subset of data for matching timestamps
  fnList.forEach(f => {
    const startIdx = indices[f][1][0] || 0;
    const endIdx = indices[f][1][1] || dataArr[f].length;
    dataArray[f] = dataArr[f].slice(startIdx, endIdx);
  });

  // Use first element as reference data
  const fnObs = fnList[0];
  const matchIdx: Record<string, [number[], number[]]> = {};

  for (let i = 1; i < fnList.length; i++) {
    const fn = fnList[i];
    matchIdx[fn] = isMember(
      getDatetime(dataArray[fn], 'dt'),
      getDatetime(dataArray[fnObs], 'dt')
    );

    const obs = getValFromIndices(dataArray[fnObs], matchIdx[fn][1]);
    const sim = getValFromIndices(dataArray[fn], matchIdx[fn][0]);
    comparisonArray[fn] = [sim, obs];
  }

  // Generate comparison array for metric calculator
  const compreadyArray: Record<string, ComparisonData[]> = {};
  for (let i = 1; i < fnList.length; i++) {
    compreadyArray[fnList[i]] = [];
    for (let j = 0; j < comparisonArray[fnList[i]][0].length; j++) {
      compreadyArray[fnList[i]].push({
        obs: comparisonArray[fnList[i]][1][j].Q,
        sim: Number(comparisonArray[fnList[i]][0][j].Q),
        dt: comparisonArray[fnList[i]][0][j].dt
      });
    }
  }

  // Calculate metrics for each product
  // const metricNameList = [
  //   'volume_error', 'agreementindex', 'bias', 'correlationcoefficient', 'covariance',
  //   'decomposed_mse', 'kge', 'log_p', 'mae', 'mse', 'nashsutcliffe',
  //   'pbias', 'rmse', 'rrmse', 'rsquared', 'rsr', 'nRMSE',
  //   'nMAE', 'timing', 'norm_bias', 'ppd', 'peak_qsim', 'qsim_vol',
  //   'qobs_vol', 'pt_change_vol'
  // ];

  const metricsLocal: MetricResult[] = [];
  const products = Object.keys(config.controls?.prod || {});

  let j = 0;
  Object.keys(compreadyArray).forEach(key => {
    try {
      const pointMetrics = allMetrics(compreadyArray, key, feature);
      pointMetrics.prod = products[j] || 'unknown';
      pointMetrics.year = Number(systemState.yr);
      pointMetrics[comIDName] = feature.properties[comIDName];

      metricsLocal.push({ ...pointMetrics });
    } catch (error) {
      console.log('Data missing on feature comID = ' + feature.properties[comIDName]);
    }
    j++;
  });

  return metricsLocal;
}
