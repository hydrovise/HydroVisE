import React, { useState } from 'react';

interface EventMetricsPanelProps {
  className?: string;
}

export const EventMetricsPanel: React.FC<EventMetricsPanelProps> = ({
  className = ''
}) => {
  const [isCalculating, setIsCalculating] = useState(false);
  const [results, setResults] = useState<Record<string, number> | null>(null);

  const handleCalculate = async () => {
    setIsCalculating(true);
    // Placeholder for event metrics calculation
    setTimeout(() => {
      setResults({
        'Nash-Sutcliffe': 0.85,
        'RMSE': 12.3,
        'Bias': -2.1,
        'Correlation': 0.92
      });
      setIsCalculating(false);
    }, 2000);
  };

  return (
    <div className={`event-metrics-panel ${className}`}>
      <div className="panel-header">
        <h3>Event Metrics</h3>
      </div>
      
      <div className="panel-content">
        <div className="metrics-controls">
          <button
            onClick={handleCalculate}
            disabled={isCalculating}
            className="calculate-btn"
          >
            {isCalculating ? 'Calculating...' : 'Calculate Metrics'}
          </button>
        </div>
        
        {results && (
          <div className="metrics-results">
            <h4>Results:</h4>
            {Object.entries(results).map(([metric, value]) => (
              <div key={metric} className="metric-row">
                <span className="metric-name">{metric}:</span>
                <span className="metric-value">{value.toFixed(3)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <style>{`
        .event-metrics-panel {
          background: rgba(0, 0, 0, 0.9);
          color: white;
          border: 1px solid #444;
          border-radius: 4px;
          padding: 16px;
          min-width: 250px;
        }
        
        .panel-header h3 {
          margin: 0 0 16px 0;
          font-size: 16px;
          color: #fff;
        }
        
        .calculate-btn {
          background: #007bff;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
          width: 100%;
        }
        
        .calculate-btn:disabled {
          background: #6c757d;
          cursor: not-allowed;
        }
        
        .metrics-results {
          margin-top: 16px;
        }
        
        .metrics-results h4 {
          margin: 0 0 8px 0;
          font-size: 14px;
        }
        
        .metric-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 4px;
          font-size: 12px;
        }
        
        .metric-name {
          color: #ccc;
        }
        
        .metric-value {
          color: #fff;
          font-weight: bold;
        }
      `}</style>
    </div>
  );
};

export default EventMetricsPanel;
