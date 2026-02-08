import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useApp } from '../context/AppContext';
import './EnhancedTimeSlider.css';

interface EnhancedTimeSliderProps {
  min?: number;
  max?: number;
  step?: number;
  value?: number;
  onValueChange?: (value: number) => void;
  onSlideStop?: (value: number) => void;
  className?: string;
  label?: string;
}

export const EnhancedTimeSlider: React.FC<EnhancedTimeSliderProps> = ({
  onValueChange,
  onSlideStop,
  className = ''
}) => {
  const { state, dispatch } = useApp();
  const [sliderValue, setSliderValue] = useState(0);
  const [label, setLabel] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const sliderRef = useRef<HTMLInputElement>(null);

  const timeSliderConfig = state.config?.timeSlider;
  const isDynamic = timeSliderConfig?.dynamicRange ? true : false;

  // Dynamic range function
  const getDynamicRange = useCallback((baseValue: number): number => {
    if (!timeSliderConfig?.dynamicRange) return baseValue;

    try {
      const dynamicFunc = new Function(
        timeSliderConfig.dynamicRange.arguments,
        timeSliderConfig.dynamicRange.body
      );
      return dynamicFunc(baseValue);
    } catch (error) {
      console.error('Error executing dynamic range function:', error);
      return baseValue;
    }
  }, [timeSliderConfig]);

  // Label generation function
  const generateLabel = useCallback((value: number): string => {
    if (!timeSliderConfig?.label) return String(value);

    try {
      const labelFunc = new Function(
        timeSliderConfig.label.arguments,
        timeSliderConfig.label.body
      );
      return labelFunc(value);
    } catch (error) {
      console.error('Error executing label function:', error);
      return String(value);
    }
  }, [timeSliderConfig]);

  // Initialize slider configuration
  useEffect(() => {
    if (!timeSliderConfig) return;

    const initialValue = timeSliderConfig.value;

    setSliderValue(initialValue);
    setLabel(generateLabel(initialValue));

    // Update system state
    dispatch({
      type: 'UPDATE_SYSTEM_STATE',
      payload: { sliderState: initialValue }
    });
  }, [timeSliderConfig, getDynamicRange, generateLabel, dispatch]);

  // Handle slider value changes
  const handleSliderChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(event.target.value);
    setSliderValue(newValue);
    setLabel(generateLabel(newValue));

    if (onValueChange) {
      onValueChange(newValue);
    }

    // Update system state during drag
    dispatch({
      type: 'UPDATE_SYSTEM_STATE',
      payload: { sliderState: newValue }
    });
  }, [generateLabel, onValueChange, dispatch]);

  // Handle mouse down (start dragging)
  const handleMouseDown = useCallback(() => {
    setIsDragging(true);
  }, []);

  // Handle mouse up (stop dragging)
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);

    if (onSlideStop) {
      onSlideStop(sliderValue);
    }
  }, [sliderValue, onSlideStop]);

  // Keyboard navigation
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (!timeSliderConfig) return;

    const step = timeSliderConfig.step;
    const minValue = getDynamicRange(timeSliderConfig.min);
    const maxValue = getDynamicRange(timeSliderConfig.max);

    let newValue = sliderValue;

    switch (event.key) {
      case 'ArrowLeft':
      case 'ArrowDown':
        newValue = Math.max(minValue, sliderValue - step);
        break;
      case 'ArrowRight':
      case 'ArrowUp':
        newValue = Math.min(maxValue, sliderValue + step);
        break;
      case 'Home':
        newValue = minValue;
        break;
      case 'End':
        newValue = maxValue;
        break;
      case 'PageDown':
        newValue = Math.max(minValue, sliderValue - step * 10);
        break;
      case 'PageUp':
        newValue = Math.min(maxValue, sliderValue + step * 10);
        break;
      default:
        return;
    }

    event.preventDefault();
    setSliderValue(newValue);
    setLabel(generateLabel(newValue));

    if (onValueChange) {
      onValueChange(newValue);
    }

    dispatch({
      type: 'UPDATE_SYSTEM_STATE',
      payload: { sliderState: newValue }
    });
  }, [timeSliderConfig, sliderValue, getDynamicRange, generateLabel, onValueChange, dispatch]);

  // Update slider range when system state changes (e.g., year changes)
  useEffect(() => {
    if (!timeSliderConfig || !isDynamic) return;

    const minValue = getDynamicRange(timeSliderConfig.min);
    const maxValue = getDynamicRange(timeSliderConfig.max);

    // Ensure current value is within new range
    if (sliderValue < minValue || sliderValue > maxValue) {
      const clampedValue = Math.max(minValue, Math.min(maxValue, sliderValue));
      setSliderValue(clampedValue);
      setLabel(generateLabel(clampedValue));
    }
  }, [state.systemState.yr, timeSliderConfig, isDynamic, getDynamicRange, generateLabel, sliderValue]);

  if (!timeSliderConfig) {
    return null;
  }

  const minValue = getDynamicRange(timeSliderConfig.min);
  const maxValue = getDynamicRange(timeSliderConfig.max);
  const step = timeSliderConfig.step;

  return (
    <div className={`enhanced-time-slider ${className}`}>
      <div className="slider-container">
        <div className="slider-track">
          <input
            ref={sliderRef}
            type="range"
            min={minValue}
            max={maxValue}
            step={step}
            value={sliderValue}
            onChange={handleSliderChange}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onKeyDown={handleKeyDown}
            className={`slider ${isDragging ? 'dragging' : ''}`}
            aria-label="Time slider"
            aria-valuemin={minValue}
            aria-valuemax={maxValue}
            aria-valuenow={sliderValue}
            aria-valuetext={label}
          />

          {/* Custom slider track with progress */}
          <div className="slider-progress">
            <div
              className="slider-fill"
              style={{
                width: `${((sliderValue - minValue) / (maxValue - minValue)) * 100}%`
              }}
            />
          </div>
        </div>

        {/* Tick marks */}
        <div className="slider-ticks">
          {Array.from({ length: Math.min(11, Math.floor((maxValue - minValue) / step) + 1) }, (_, i) => {
            const tickValue = minValue + (i * (maxValue - minValue) / 10);
            const position = ((tickValue - minValue) / (maxValue - minValue)) * 100;

            return (
              <div
                key={i}
                className="tick"
                style={{ left: `${position}%` }}
                title={generateLabel(Math.round(tickValue))}
              />
            );
          })}
        </div>
      </div>

      <div className="slider-label">
        {label}
      </div>

      <div className="slider-controls">
        <button
          className="control-btn"
          onClick={() => {
            const newValue = Math.max(minValue, sliderValue - step);
            setSliderValue(newValue);
            setLabel(generateLabel(newValue));
            if (onValueChange) onValueChange(newValue);
          }}
          disabled={sliderValue <= minValue}
          title="Previous step"
        >
          ⏮
        </button>

        <button
          className="control-btn"
          onClick={() => {
            const newValue = Math.min(maxValue, sliderValue + step);
            setSliderValue(newValue);
            setLabel(generateLabel(newValue));
            if (onValueChange) onValueChange(newValue);
          }}
          disabled={sliderValue >= maxValue}
          title="Next step"
        >
          ⏭
        </button>

        <div className="range-info">
          <span className="range-min">{generateLabel(minValue)}</span>
          <span className="range-separator">—</span>
          <span className="range-max">{generateLabel(maxValue)}</span>
        </div>
      </div>
    </div>
  );
};

export default EnhancedTimeSlider;
