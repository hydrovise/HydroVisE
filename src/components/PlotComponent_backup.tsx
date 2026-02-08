import React, { useEffect, useRef } from 'react';
import Plot from 'react-plotly.js';
import { useApp } from '../context/AppContext';
import Papa from 'papaparse';

interface PlotComponentProps {
  isVisible: boolean;
  onToggle: () => void;
}

export default function PlotComponent({ isVisible, onToggle }: PlotComponentProps) {
  const plotRef = useRef<any>(null);
  const { state } = useApp();

  const [plotData, setPlotData] = React.useState<any[]>([]);
  const [plotLayout, setPlotLayout] = React.useState<any>({
    title: 'Time Series Plot',
    xaxis: { title: 'Time' },
    yaxis: { title: 'Value' },
    showlegend: true,
    autosize: true,
    margin: { l: 50, r: 50, t: 50, b: 50 }
  });
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  useEffect(() => {
    if (!state.config) return;

    // Initialize plot layout from config
    if (state.config.plotlyLayout) {
      setPlotLayout((prevLayout: any) => ({
        ...prevLayout,
        ...state.config!.plotlyLayout,
        autosize: true
      }));
    }
  }, [state.config]);

  const formatArray = (template: string, values: any[]): string => {
    let result = template;
    values.forEach((value, index) => {
      result = result.replace(`{${index}}`, String(value));
    });
    return result;
  };

  const generatePlotTitle = (comID: string | number) => {
    if (!state.config?.mapMarkers?.plotTitle) {
      return `Time Series - comID: ${comID}`;
    }

    const titleConfig = state.config.mapMarkers.plotTitle.template;
    // For now, use a simple title format
    // In full implementation, would look up marker features for dynamic title
    return formatArray(titleConfig.format, [comID]);
  };

  const loadTraceData = async (year: number | string, comID: string | number) => {
    if (!state.config) return;

    setLoading(true);
    setError(null);

    const traces = state.config.traces;
    const newData: any[] = [];

    for (const [traceKey, traceConfig] of Object.entries(traces)) {
      try {
        // Build URL from template
        const vars = traceConfig.template.var;
        const pathFormat = traceConfig.template.path_format;

        let url = pathFormat;
        vars.forEach((varName, index) => {
          const value = varName === 'yr' ? year :
            varName === 'comID' ? comID : '';
          url = url.replace(`{${index}}`, String(value));
        });

        console.log(`Loading trace ${traceKey} from:`, url);

        // Fetch and parse CSV data using PapaParse for better CSV handling
        const response = await fetch(url);
        if (!response.ok) {
          console.warn(`HTTP ${response.status} for trace ${traceKey}`);
          continue;
        }

        const csvText = await response.text();

        // Parse CSV with PapaParse
        const parseResult = Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          dynamicTyping: true
        });

        if (parseResult.errors.length > 0) {
          console.warn(`CSV parse errors for ${traceKey}:`, parseResult.errors);
        }

        const data = parseResult.data as any[];
        if (!data.length) continue;

        const x: any[] = [];
        const y: any[] = [];

        data.forEach(row => {
          const xValue = row[traceConfig.x_name];
          const yValue = row[traceConfig.y_name];

          if (xValue !== undefined && yValue !== undefined && yValue !== null) {
            x.push(xValue);
            y.push(Number(yValue));
          }
        });

        if (x.length === 0) continue;

        newData.push({
          x,
          y,
          ...traceConfig.style,
          name: traceConfig.style.name || traceKey
        });
      } catch (error) {
        console.warn(`Failed to load trace ${traceKey}:`, error);
      }
    }

    if (newData.length === 0) {
      setError('No data could be loaded for the selected location and year.');
    } else {
      setError(null);
    }

    setPlotData(newData);
    setLoading(false);

    // Update plot title
    const title = generatePlotTitle(comID);
    setPlotLayout((prevLayout: any) => ({
      ...prevLayout,
      title: title
    }));
  };

  // Load data when comID changes
  useEffect(() => {
    if (state.systemState.comID && state.systemState.yr) {
      loadTraceData(state.systemState.yr, state.systemState.comID);
    }
  }, [state.systemState.comID, state.systemState.yr, state.config]);

  if (!isVisible) return null;

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '40%',
        backgroundColor: 'white',
        zIndex: 1000,
        borderTop: '2px solid #ccc'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', backgroundColor: '#f5f5f5' }}>
        <h3 style={{ margin: 0, color: 'black' }}>
          Time Series Plot {loading && '(Loading...)'}
        </h3>
        <button onClick={onToggle} style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer' }}>
          ×
        </button>
      </div>

      {error && (
        <div style={{
          padding: '20px',
          color: 'red',
          textAlign: 'center',
          backgroundColor: '#ffe6e6',
          margin: '10px'
        }}>
          {error}
        </div>
      )}

      <div style={{ height: 'calc(100% - 50px)' }}>
        {plotData.length > 0 && !loading && (
          <Plot
            ref={plotRef}
            data={plotData}
            layout={{
              ...plotLayout,
              autosize: true,
              margin: { l: 50, r: 50, t: 30, b: 50 }
            }}
            style={{ width: '100%', height: '100%' }}
            useResizeHandler={true}
            config={{
              displayModeBar: true,
              displaylogo: false,
              modeBarButtonsToRemove: ['pan2d', 'lasso2d'],
              modeBarButtonsToAdd: [{
                name: 'Download plot as PNG',
                title: 'Download plot as PNG',
                icon: {
                  'width': 1792,
                  'path': 'M512 1376v288q0 40-28 68t-68 28h-320q-40 0-68-28t-28-68v-288q0-40 28-68t68-28h320q40 0 68 28t28 68zM1792 1376v288q0 40-28 68t-68 28h-320q-40 0-68-28t-28-68v-288q0-40 28-68t68-28h320q40 0 68 28t28 68zM512 640v288q0 40-28 68t-68 28h-320q-40 0-68-28t-28-68v-288q0-40 28-68t68-28h320q40 0 68 28t28 68zM1792 640v288q0 40-28 68t-68 28h-320q-40 0-68-28t-28-68v-288q0-40 28-68t68-28h320q40 0 68 28t28 68zM512 96v192q0 40-28 68t-68 28h-320q-40 0-68-28t-28-68v-192q0-40 28-68t68-28h320q40 0 68 28t28 68zM1792 96v192q0 40-28 68t-68 28h-320q-40 0-68-28t-28-68v-192q0-40 28-68t68-28h320q40 0 68 28t28 68z',
                  'height': 1792
                },
                click: (gd: any) => {
                  // Use Plotly's built-in download functionality
                  const Plotly = (window as any).Plotly;
                  if (Plotly && Plotly.downloadImage) {
                    Plotly.downloadImage(gd);
                  }
                }
              }]
            }}
          />
        )}

        {loading && (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
            fontSize: '18px',
            color: '#666'
          }}>
            Loading time series data...
          </div>
        )}

        {!loading && plotData.length === 0 && !error && (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
            fontSize: '18px',
            color: '#666'
          }}>
            Click on a map feature to load time series data
          </div>
        )}
      </div>
    </div>
  );
}
