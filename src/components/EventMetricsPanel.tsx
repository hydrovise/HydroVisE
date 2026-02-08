import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { calcEventMetrics, MetricResult, ProgressCallback } from '../utils/eventMetrics';

interface EventMetricsProps {
  onMetricsCalculated?: (metrics: MetricResult[]) => void;
}

export const EventMetricsPanel: React.FC<EventMetricsProps> = ({ onMetricsCalculated }) => {
  const { state } = useApp()!;
  const [isCalculating, setIsCalculating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<MetricResult[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCalculateMetrics = async () => {
    if (!state.config || !state.mapMarkers) {
      setError('Configuration or map markers not loaded');
      return;
    }

    setIsCalculating(true);
    setProgress(0);
    setError(null);

    try {
      const comIDName = state.config.mapMarkers?.comIDName || 'comid';

      const progressCallback: ProgressCallback = (progress: number) => {
        setProgress(Math.round(progress));
      };

      const metrics = await calcEventMetrics(
        state.mapMarkers,
        state.config,
        state.systemState,
        comIDName,
        progressCallback
      );

      setResults(metrics);
      setProgress(100);

      if (onMetricsCalculated) {
        onMetricsCalculated(metrics);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to calculate metrics');
      console.error('Error calculating event metrics:', err);
    } finally {
      setIsCalculating(false);
    }
  };

  const downloadResults = () => {
    if (!results) return;

    const csv = convertToCSV(results);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `event_metrics_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const convertToCSV = (data: MetricResult[]): string => {
    if (data.length === 0) return '';

    const headers = Object.keys(data[0]);
    const csvHeaders = headers.join(',');

    const csvRows = data.map(row =>
      headers.map(header => {
        const value = row[header as keyof MetricResult];
        return typeof value === 'string' ? `"${value}"` : value;
      }).join(',')
    );

    return [csvHeaders, ...csvRows].join('\n');
  };

  const formatMetricValue = (value: number): string => {
    if (typeof value !== 'number') return 'N/A';
    if (Math.abs(value) < 0.001) return value.toExponential(3);
    return value.toFixed(3);
  };

  if (!state.config?.calcMetrics) {
    return null;
  }

  return (
    <div className="event-metrics-panel">
      <div className="metrics-header">
        <h3>Event Metrics Calculator</h3>
        <button
          className="calculate-button"
          onClick={handleCalculateMetrics}
          disabled={isCalculating || !state.mapMarkers}
        >
          {isCalculating ? 'Calculating...' : 'Calculate Event Metrics'}
        </button>
      </div>

      {isCalculating && (
        <div className="progress-container">
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${progress}%` }}
            >
              {progress}%
            </div>
          </div>
          <p>Processing features: {progress}% complete</p>
        </div>
      )}

      {error && (
        <div className="error-message">
          <strong>Error:</strong> {error}
        </div>
      )}

      {results && (
        <div className="results-container">
          <div className="results-header">
            <h4>Calculation Complete</h4>
            <div className="results-actions">
              <button onClick={downloadResults} className="download-button">
                Download CSV
              </button>
              <span className="results-count">
                {results.length} features processed
              </span>
            </div>
          </div>

          <div className="results-summary">
            <div className="summary-grid">
              <div className="summary-item">
                <label>Features:</label>
                <span>{new Set(results.map(r => r.comid || r.link_id)).size}</span>
              </div>
              <div className="summary-item">
                <label>Products:</label>
                <span>{new Set(results.map(r => r.prod)).size}</span>
              </div>
              <div className="summary-item">
                <label>Year:</label>
                <span>{results[0]?.year || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Sample metrics display */}
          {results.length > 0 && (
            <div className="sample-metrics">
              <h5>Sample Metrics (First Feature)</h5>
              <div className="metrics-grid">
                <div className="metric-item">
                  <label>Nash-Sutcliffe:</label>
                  <span>{formatMetricValue(results[0].nashsutcliffe)}</span>
                </div>
                <div className="metric-item">
                  <label>RMSE:</label>
                  <span>{formatMetricValue(results[0].rmse)}</span>
                </div>
                <div className="metric-item">
                  <label>Bias:</label>
                  <span>{formatMetricValue(results[0].bias)}</span>
                </div>
                <div className="metric-item">
                  <label>R²:</label>
                  <span>{formatMetricValue(results[0].rsquared)}</span>
                </div>
                <div className="metric-item">
                  <label>KGE:</label>
                  <span>{formatMetricValue(results[0].kge)}</span>
                </div>
                <div className="metric-item">
                  <label>PBIAS:</label>
                  <span>{formatMetricValue(results[0].pbias)}%</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      import './EventMetricsPanel.css';
    </div>
  );
};

export default EventMetricsPanel;
