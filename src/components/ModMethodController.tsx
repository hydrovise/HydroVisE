import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import * as math from 'mathjs';

// Rating curve coefficients cache
let rcCoef: Record<string, number[][]> = {};

// Constants
const CFS_TO_CMS = 0.0283168;

// Polynomial regression for rating curve fitting
function polynomialRegressor(x: number[], y: number[], order: number = 3): number[][] {
  const n = x.length;

  // Create Vandermonde matrix
  const A: number[][] = [];
  for (let i = 0; i < n; i++) {
    A[i] = [];
    for (let j = 0; j <= order; j++) {
      A[i][j] = Math.pow(x[i], j);
    }
  }

  // Solve normal equations: A^T * A * coef = A^T * y
  try {
    const AT = math.transpose(A);
    const ATA = math.multiply(AT, A) as number[][];
    const ATy = math.multiply(AT, y) as number[];
    const coefficients = math.lusolve(ATA, ATy) as number[][];

    return coefficients;
  } catch (error) {
    console.error('Error in polynomial regression:', error);
    return [[0], [1]]; // Linear fallback
  }
}

// Apply polynomial function
function polynomialFunction(flow: number, coef: number[][]): number {
  let total = 0;
  for (let i = 0; i < coef.length; i++) {
    total += coef[i][0] * Math.pow(flow, i);
  }
  return total;
}

// Load rating curve data
async function loadRatingCurve(lid: string): Promise<void> {
  try {
    const response = await fetch('http://s-iihr50.iihr.uiowa.edu/smap/retro/data/ratingCurve/rc_usgs.csv');
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const csvText = await response.text();
    const lines = csvText.split('\n');
    const headers = lines[0].split(',');

    const data = lines.slice(1)
      .filter(line => line.trim())
      .map(line => {
        const values = line.split(',');
        const obj: Record<string, string> = {};
        headers.forEach((header, index) => {
          obj[header.trim()] = values[index]?.trim() || '';
        });
        return obj;
      });

    const dataRc = data.filter(row => row['link_id'] === String(lid));

    if (dataRc.length === 0) {
      console.warn(`No rating curve data found for link_id: ${lid}`);
      return;
    }

    const discharge = dataRc.map(row => Number(row['discharge_l']) * CFS_TO_CMS);
    const stage = dataRc.map(row => Number(row['stage_l']));

    rcCoef[lid] = polynomialRegressor(discharge, stage, 3);
  } catch (error) {
    console.error(`Error loading rating curve for ${lid}:`, error);
  }
}

// Flow to stage conversion
export function flowToStage(flowArr: number[], linkId: string): number[] {
  // Load rating curve if not cached
  if (!rcCoef[linkId]) {
    console.warn(`Rating curve not loaded for ${linkId}. Loading asynchronously...`);
    loadRatingCurve(linkId);
    return flowArr; // Return original data if curve not available
  }

  return flowArr.map(val => {
    if (val === null || val === undefined || (val as any) === '') {
      return val as any;
    }
    return polynomialFunction(Number(val), rcCoef[linkId]);
  });
}

// Mod method registry
interface ModMethod {
  name: string;
  displayName: string;
  method: (data: number[], ...args: any[]) => number[];
  description: string;
}

export const modMethods: Record<string, ModMethod> = {
  Q2Stage: {
    name: 'Q2Stage',
    displayName: 'Discharge to Stage',
    method: (flowArr: number[], linkId: string) => flowToStage(flowArr, linkId),
    description: 'Convert discharge values to stage using rating curve'
  },
  // Add more mod methods here as needed
  unitConversion: {
    name: 'unitConversion',
    displayName: 'Unit Conversion',
    method: (data: number[], factor: number = 1) => data.map(val => Number(val) * factor),
    description: 'Apply unit conversion factor to data'
  },
  logarithmic: {
    name: 'logarithmic',
    displayName: 'Logarithmic Transform',
    method: (data: number[]) => data.map(val => val > 0 ? Math.log(val) : 0),
    description: 'Apply logarithmic transformation to data'
  }
};

// Mod trace interface
export interface ModTrace {
  modJS: string;
  modMethod: string;
  modEvnt: string;
  customEval?: string;
  mod: Record<string, {
    button: string;
    val: string;
    pltPath: string;
  }>;
}

interface ModMethodControllerProps {
  onMethodChange?: (method: string, mode: string) => void;
}

export const ModMethodController: React.FC<ModMethodControllerProps> = ({ onMethodChange }) => {
  const { state, dispatch } = useContext(AppContext)!;
  const [selectedMethod, setSelectedMethod] = useState<string>('default');
  const [selectedMode, setSelectedMode] = useState<string>('default');
  const [availableMethods, setAvailableMethods] = useState<string[]>([]);
  const [availableModes, setAvailableModes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const modConfig = state.config?.modTrace;

  // Initialize available methods and modes
  useEffect(() => {
    if (!modConfig) return;

    const methods = Object.keys(modMethods);
    setAvailableMethods(['default', ...methods]);

    if (modConfig.mod) {
      const modes = Object.keys(modConfig.mod);
      setAvailableModes(['default', ...modes]);
    }
  }, [modConfig]);

  // Load rating curves for current features
  useEffect(() => {
    if (!state.mapMarkers || !modConfig) return;

    const loadCurvesForFeatures = async () => {
      setLoading(true);
      const features = state.mapMarkers.features || [];
      const linkIds = features.map((f: any) => f.properties?.link_id || f.properties?.comid);

      // Load rating curves for all features
      const loadPromises = linkIds.map((id: string) => {
        if (id && !rcCoef[id]) {
          return loadRatingCurve(id);
        }
        return Promise.resolve();
      });

      try {
        await Promise.all(loadPromises);
      } catch (error) {
        console.error('Error loading rating curves:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCurvesForFeatures();
  }, [state.mapMarkers, modConfig]);

  const handleMethodChange = (method: string) => {
    setSelectedMethod(method);

    // Update system state
    // Update system state
    dispatch({
      type: 'UPDATE_SYSTEM_STATE',
      payload: { mod: method }
    });

    if (onMethodChange) {
      onMethodChange(method, selectedMode);
    }
  };

  const handleModeChange = (mode: string) => {
    setSelectedMode(mode);

    if (onMethodChange) {
      onMethodChange(selectedMethod, mode);
    }
  };



  if (!modConfig) {
    return null;
  }

  return (
    <div className="mod-method-controller">
      <div className="mod-header">
        <h4>Data Transformation</h4>
        {loading && <span className="loading-indicator">Loading curves...</span>}
      </div>

      <div className="mod-controls">
        <div className="control-group">
          <label htmlFor="method-select">Method:</label>
          <select
            id="method-select"
            value={selectedMethod}
            onChange={(e) => handleMethodChange(e.target.value)}
            className="method-select"
          >
            {availableMethods.map(method => (
              <option key={method} value={method}>
                {method === 'default' ? 'Original Data' : modMethods[method]?.displayName || method}
              </option>
            ))}
          </select>
        </div>

        {availableModes.length > 1 && (
          <div className="control-group">
            <label htmlFor="mode-select">Mode:</label>
            <select
              id="mode-select"
              value={selectedMode}
              onChange={(e) => handleModeChange(e.target.value)}
              className="mode-select"
            >
              {availableModes.map(mode => (
                <option key={mode} value={mode}>
                  {mode === 'default' ? 'Default' : modConfig.mod?.[mode]?.button || mode}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {selectedMethod !== 'default' && modMethods[selectedMethod] && (
        <div className="method-info">
          <p>{modMethods[selectedMethod].description}</p>
        </div>
      )}

      <div className="curve-status">
        <h5>Rating Curve Status</h5>
        <div className="status-grid">
          {Object.keys(rcCoef).map(linkId => (
            <div key={linkId} className="status-item">
              <span className="link-id">{linkId}</span>
              <span className="status-indicator loaded">✓</span>
            </div>
          ))}
        </div>
      </div>

      import './ModMethodController.css';
    </div>
  );
};

// Hook for using mod methods
export const useModMethods = () => {
  const { state } = useContext(AppContext)!;

  const applyMethod = (data: number[], methodName: string, ...args: any[]): number[] => {
    const method = modMethods[methodName];
    if (!method) {
      console.warn(`Mod method ${methodName} not found`);
      return data;
    }

    try {
      return method.method(data, ...args);
    } catch (error) {
      console.error(`Error applying mod method ${methodName}:`, error);
      return data;
    }
  };

  const isMethodAvailable = (methodName: string): boolean => {
    return methodName in modMethods;
  };

  const getMethodDescription = (methodName: string): string => {
    return modMethods[methodName]?.description || 'No description available';
  };

  return {
    applyMethod,
    isMethodAvailable,
    getMethodDescription,
    availableMethods: Object.keys(modMethods),
    modConfig: state.config?.modTrace
  };
};

export default ModMethodController;
