import React, { useState, useEffect } from 'react';

interface SimpleSpatialDataAnimationProps {
  spatialDataKey?: string;
  className?: string;
}

export const SimpleSpatialDataAnimation: React.FC<SimpleSpatialDataAnimationProps> = ({
  spatialDataKey = 'default',
  className = ''
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [totalFrames] = useState(100); // Mock data
  const [playbackSpeed, setPlaybackSpeed] = useState(1);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentFrame(prev => {
          if (prev >= totalFrames - 1) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 1;
        });
      }, 1000 / playbackSpeed);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, playbackSpeed, totalFrames]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleStepForward = () => {
    setCurrentFrame(prev => Math.min(prev + 1, totalFrames - 1));
  };

  const handleStepBackward = () => {
    setCurrentFrame(prev => Math.max(prev - 1, 0));
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentFrame(0);
  };

  return (
    <div className={`spatial-animation-panel ${className}`}>
      <div className="panel-header">
        <h3>Spatial Animation</h3>
        <small>Data: {spatialDataKey}</small>
      </div>
      
      <div className="panel-content">
        <div className="frame-info">
          <span>Frame: {currentFrame + 1} / {totalFrames}</span>
        </div>
        
        <div className="timeline-container">
          <input
            type="range"
            min={0}
            max={totalFrames - 1}
            value={currentFrame}
            onChange={(e) => setCurrentFrame(parseInt(e.target.value))}
            className="timeline-slider"
          />
        </div>
        
        <div className="controls">
          <button onClick={handleStepBackward} disabled={currentFrame === 0}>
            ⏮
          </button>
          <button onClick={handlePlayPause}>
            {isPlaying ? '⏸' : '▶'}
          </button>
          <button onClick={handleStepForward} disabled={currentFrame >= totalFrames - 1}>
            ⏭
          </button>
          <button onClick={handleReset}>
            ⏹
          </button>
        </div>
        
        <div className="speed-control">
          <label>Speed: {playbackSpeed}x</label>
          <input
            type="range"
            min={0.1}
            max={5}
            step={0.1}
            value={playbackSpeed}
            onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value))}
            className="speed-slider"
          />
        </div>
      </div>
      
      <style>{`
        .spatial-animation-panel {
          background: rgba(0, 0, 0, 0.9);
          color: white;
          border: 1px solid #444;
          border-radius: 4px;
          padding: 16px;
          min-width: 280px;
        }
        
        .panel-header h3 {
          margin: 0 0 4px 0;
          font-size: 16px;
          color: #fff;
        }
        
        .panel-header small {
          color: #999;
          font-size: 12px;
        }
        
        .frame-info {
          margin: 12px 0 8px 0;
          font-size: 12px;
          color: #ccc;
          text-align: center;
        }
        
        .timeline-container {
          margin: 8px 0;
        }
        
        .timeline-slider, .speed-slider {
          width: 100%;
          margin: 4px 0;
        }
        
        .controls {
          display: flex;
          justify-content: center;
          gap: 8px;
          margin: 12px 0;
        }
        
        .controls button {
          background: #007bff;
          color: white;
          border: none;
          padding: 8px 12px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
        }
        
        .controls button:disabled {
          background: #6c757d;
          cursor: not-allowed;
        }
        
        .speed-control {
          margin-top: 12px;
        }
        
        .speed-control label {
          display: block;
          font-size: 12px;
          color: #ccc;
          margin-bottom: 4px;
        }
      `}</style>
    </div>
  );
};

export default SimpleSpatialDataAnimation;
