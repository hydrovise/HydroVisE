import React, { useState } from 'react';

interface SimpleModMethodControllerProps {
  className?: string;
}

export const SimpleModMethodController: React.FC<SimpleModMethodControllerProps> = ({
  className = ''
}) => {
  const [selectedMethod, setSelectedMethod] = useState('flow2stage');
  const [isProcessing, setIsProcessing] = useState(false);

  const methods = [
    { id: 'flow2stage', name: 'Flow to Stage Conversion' },
    { id: 'unit_conversion', name: 'Unit Conversion' },
    { id: 'data_smoothing', name: 'Data Smoothing' }
  ];

  const handleApplyMethod = async () => {
    setIsProcessing(true);
    // Placeholder for method application
    setTimeout(() => {
      setIsProcessing(false);
    }, 1500);
  };

  return (
    <div className={`mod-method-controller ${className}`}>
      <div className="panel-header">
        <h3>Data Transformation</h3>
      </div>
      
      <div className="panel-content">
        <div className="method-selector">
          <label htmlFor="method-select">Method:</label>
          <select
            id="method-select"
            value={selectedMethod}
            onChange={(e) => setSelectedMethod(e.target.value)}
            className="method-select"
          >
            {methods.map(method => (
              <option key={method.id} value={method.id}>
                {method.name}
              </option>
            ))}
          </select>
        </div>
        
        <div className="method-controls">
          <button
            onClick={handleApplyMethod}
            disabled={isProcessing}
            className="apply-btn"
          >
            {isProcessing ? 'Processing...' : 'Apply Method'}
          </button>
        </div>
        
        {selectedMethod === 'flow2stage' && (
          <div className="method-info">
            <p>Converts flow data to stage using rating curves</p>
          </div>
        )}
      </div>
      
      <style>{`
        .mod-method-controller {
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
        
        .method-selector {
          margin-bottom: 16px;
        }
        
        .method-selector label {
          display: block;
          margin-bottom: 4px;
          font-size: 12px;
          color: #ccc;
        }
        
        .method-select {
          width: 100%;
          padding: 6px;
          background: #333;
          color: white;
          border: 1px solid #555;
          border-radius: 4px;
        }
        
        .apply-btn {
          background: #28a745;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
          width: 100%;
        }
        
        .apply-btn:disabled {
          background: #6c757d;
          cursor: not-allowed;
        }
        
        .method-info {
          margin-top: 12px;
          padding: 8px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
          font-size: 12px;
          color: #ccc;
        }
      `}</style>
    </div>
  );
};

export default SimpleModMethodController;
