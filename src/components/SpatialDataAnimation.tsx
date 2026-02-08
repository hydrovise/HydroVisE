import React, { useState, useEffect, useContext, useCallback } from 'react';
import { AppContext } from '../context/AppContext';
import Plot from 'react-plotly.js';
import moment from 'moment';

interface SpatialDataAnimationProps {
  spatialDataKey: string;
  onTimeChange?: (timestamp: number) => void;
  onAnimationToggle?: (isPlaying: boolean) => void;
}

interface AnimationControls {
  isPlaying: boolean;
  currentIndex: number;
  timestamps: number[];
  timestampStrings: string[];
}

export const SpatialDataAnimation: React.FC<SpatialDataAnimationProps> = ({
  spatialDataKey,
  onTimeChange,
  onAnimationToggle
}) => {
  const { state } = useContext(AppContext)!;
  const [controls, setControls] = useState<AnimationControls>({
    isPlaying: false,
    currentIndex: 0,
    timestamps: [],
    timestampStrings: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [animationSpeed, setAnimationSpeed] = useState(500); // milliseconds between frames

  const spatialConfig = state.config?.spatialData?.[spatialDataKey];

  // Load timestamps for the spatial data
  useEffect(() => {
    if (!spatialConfig) return;

    const loadTimestamps = async () => {
      setLoading(true);
      setError(null);

      try {
        const timestampsConfig = spatialConfig.timestamps;
        if (!timestampsConfig) throw new Error('Timestamps configuration missing');
        const response = await fetch(timestampsConfig.fnPath);

        if (!response.ok) {
          throw new Error(`Failed to load timestamps: ${response.statusText}`);
        }

        let timestamps: number[];

        if (timestampsConfig.extension === 'json') {
          timestamps = await response.json();
        } else {
          // Assume text format with one timestamp per line
          const text = await response.text();
          timestamps = text.trim().split('\n').map(line => parseInt(line.trim()));
        }

        const timestampStrings = timestamps.map(ts =>
          moment.unix(ts).format('YYYY-MM-DD HH:mm')
        );

        setControls(prev => ({
          ...prev,
          timestamps,
          timestampStrings,
          currentIndex: 0
        }));

        // Set initial time
        if (timestamps.length > 0 && onTimeChange) {
          onTimeChange(timestamps[0]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load timestamps');
        console.error('Error loading timestamps:', err);
      } finally {
        setLoading(false);
      }
    };

    loadTimestamps();
  }, [spatialConfig, onTimeChange]);

  // Animation loop
  useEffect(() => {
    if (!controls.isPlaying || controls.timestamps.length === 0) return;

    const interval = setInterval(() => {
      setControls(prev => {
        const nextIndex = (prev.currentIndex + 1) % prev.timestamps.length;

        if (onTimeChange && prev.timestamps[nextIndex]) {
          onTimeChange(prev.timestamps[nextIndex]);
        }

        // Stop at the end if not looping
        if (nextIndex === 0) {
          if (onAnimationToggle) onAnimationToggle(false);
          return { ...prev, isPlaying: false, currentIndex: nextIndex };
        }

        return { ...prev, currentIndex: nextIndex };
      });
    }, animationSpeed);

    return () => clearInterval(interval);
  }, [controls.isPlaying, controls.timestamps.length, animationSpeed, onTimeChange, onAnimationToggle]);

  const handlePlay = useCallback(() => {
    const newIsPlaying = !controls.isPlaying;
    setControls(prev => ({ ...prev, isPlaying: newIsPlaying }));
    if (onAnimationToggle) {
      onAnimationToggle(newIsPlaying);
    }
  }, [controls.isPlaying, onAnimationToggle]);

  const handleStop = useCallback(() => {
    setControls(prev => ({ ...prev, isPlaying: false, currentIndex: 0 }));
    if (onAnimationToggle) {
      onAnimationToggle(false);
    }
    if (onTimeChange && controls.timestamps[0]) {
      onTimeChange(controls.timestamps[0]);
    }
  }, [controls.timestamps, onTimeChange, onAnimationToggle]);

  const handlePrevious = useCallback(() => {
    setControls(prev => {
      const newIndex = Math.max(0, prev.currentIndex - 1);
      if (onTimeChange && prev.timestamps[newIndex]) {
        onTimeChange(prev.timestamps[newIndex]);
      }
      return { ...prev, currentIndex: newIndex, isPlaying: false };
    });
    if (onAnimationToggle) {
      onAnimationToggle(false);
    }
  }, [onTimeChange, onAnimationToggle]);

  const handleNext = useCallback(() => {
    setControls(prev => {
      const newIndex = Math.min(prev.timestamps.length - 1, prev.currentIndex + 1);
      if (onTimeChange && prev.timestamps[newIndex]) {
        onTimeChange(prev.timestamps[newIndex]);
      }
      return { ...prev, currentIndex: newIndex, isPlaying: false };
    });
    if (onAnimationToggle) {
      onAnimationToggle(false);
    }
  }, [onTimeChange, onAnimationToggle]);

  const handleSliderChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const newIndex = parseInt(event.target.value);
    setControls(prev => {
      if (onTimeChange && prev.timestamps[newIndex]) {
        onTimeChange(prev.timestamps[newIndex]);
      }
      return { ...prev, currentIndex: newIndex, isPlaying: false };
    });
    if (onAnimationToggle) {
      onAnimationToggle(false);
    }
  }, [onTimeChange, onAnimationToggle]);

  const handleTimeClick = useCallback((event: any) => {
    if (event.points && event.points.length > 0) {
      const clickedTime = event.points[0].x;
      const timestamp = moment(clickedTime).unix();

      // Find closest timestamp index
      const closestIndex = controls.timestamps.reduce((closest, current, index) => {
        return Math.abs(current - timestamp) < Math.abs(controls.timestamps[closest] - timestamp)
          ? index : closest;
      }, 0);

      setControls(prev => ({ ...prev, currentIndex: closestIndex }));

      if (onTimeChange) {
        onTimeChange(controls.timestamps[closestIndex]);
      }
    }
  }, [controls.timestamps, onTimeChange]);

  if (!spatialConfig) {
    return <div>No spatial configuration found for key: {spatialDataKey}</div>;
  }

  if (loading) {
    return <div className="loading">Loading temporal data...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  if (controls.timestamps.length === 0) {
    return <div>No temporal data available</div>;
  }

  const currentTimestamp = controls.timestampStrings[controls.currentIndex] || '';

  // Create timeline plot data
  const timelineData = [{
    x: controls.timestampStrings,
    y: Array(controls.timestampStrings.length).fill(1),
    type: 'bar' as const,
    hoverinfo: 'x' as const,
    showlegend: false,
    marker: {
      color: controls.timestampStrings.map((_, index) =>
        index === controls.currentIndex ? '#ff0000' : '#1f77b4'
      ),
      opacity: 0.7
    },
    name: spatialConfig.name || spatialDataKey
  }];

  const timelineLayout = {
    height: 100,
    margin: { l: 50, r: 50, t: 20, b: 40 },
    xaxis: {
      title: 'Time',
      type: 'category' as const,
      range: state.systemState.xRange || undefined
    },
    yaxis: {
      title: '',
      showticklabels: false
    },
    showlegend: false
  };

  return (
    <div className="spatial-animation-panel">
      <div className="animation-header">
        <h4>{spatialConfig.name || spatialDataKey}</h4>
        <div className="current-time">
          {currentTimestamp}
        </div>
      </div>

      <div className="animation-controls">
        <button
          className="control-btn"
          onClick={handlePrevious}
          disabled={controls.currentIndex === 0}
          title="Previous Frame"
        >
          ⏮
        </button>

        <button
          className="control-btn play-btn"
          onClick={handlePlay}
          title={controls.isPlaying ? "Pause" : "Play"}
        >
          {controls.isPlaying ? '⏸' : '▶'}
        </button>

        <button
          className="control-btn"
          onClick={handleStop}
          title="Stop and Reset"
        >
          ⏹
        </button>

        <button
          className="control-btn"
          onClick={handleNext}
          disabled={controls.currentIndex === controls.timestamps.length - 1}
          title="Next Frame"
        >
          ⏭
        </button>

        <div className="speed-control">
          <label>Speed:</label>
          <select
            value={animationSpeed}
            onChange={(e) => setAnimationSpeed(parseInt(e.target.value))}
          >
            <option value={100}>Very Fast</option>
            <option value={250}>Fast</option>
            <option value={500}>Normal</option>
            <option value={1000}>Slow</option>
            <option value={2000}>Very Slow</option>
          </select>
        </div>
      </div>

      <div className="timeline-slider">
        <input
          type="range"
          min={0}
          max={controls.timestamps.length - 1}
          value={controls.currentIndex}
          onChange={handleSliderChange}
          className="slider"
        />
        <div className="slider-labels">
          <span>{controls.timestampStrings[0] || ''}</span>
          <span>{controls.timestampStrings[controls.timestampStrings.length - 1] || ''}</span>
        </div>
      </div>

      <div className="timeline-plot">
        <Plot
          data={timelineData}
          layout={timelineLayout as any}
          onClick={handleTimeClick}
          config={{ displayModeBar: false, responsive: true }}
        />
      </div>

      <div className="frame-info">
        Frame: {controls.currentIndex + 1} / {controls.timestamps.length}
      </div>
    </div>
  );
};

import './SpatialDataAnimation.css';


export default SpatialDataAnimation;
