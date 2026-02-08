import React, { useState, useEffect } from 'react';

interface SimpleTimeSliderProps {
  min?: number;
  max?: number;
  step?: number;
  value?: number;
  onValueChange?: (value: number) => void;
  onSlideStop?: (value: number) => void;
  className?: string;
  label?: string;
}

export const SimpleTimeSlider: React.FC<SimpleTimeSliderProps> = ({
  min = 0,
  max = 100,
  step = 1,
  value = 0,
  onValueChange,
  onSlideStop,
  className = '',
  label = ''
}) => {
  const [sliderValue, setSliderValue] = useState(value);

  useEffect(() => {
    setSliderValue(value);
  }, [value]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(event.target.value);
    setSliderValue(newValue);
    onValueChange?.(newValue);
  };

  const handleMouseUp = () => {
    onSlideStop?.(sliderValue);
  };

  return (
    <div className={`time-slider-container ${className}`}>
      {label && <div className="time-slider-label">{label}</div>}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={sliderValue}
        onChange={handleChange}
        onMouseUp={handleMouseUp}
        onTouchEnd={handleMouseUp}
        className="time-slider"
      />
      <div className="time-slider-value">{sliderValue}</div>
      <style>{`
        .time-slider-container {
          display: flex;
          flex-direction: column;
          gap: 8px;
          padding: 16px;
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        
        .time-slider-label {
          font-weight: 500;
          color: #333;
        }
        
        .time-slider {
          width: 100%;
          height: 6px;
          border-radius: 3px;
          background: #ddd;
          outline: none;
          -webkit-appearance: none;
        }
        
        .time-slider::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #007cba;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        
        .time-slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #007cba;
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        
        .time-slider-value {
          text-align: center;
          font-size: 14px;
          color: #666;
        }
      `}</style>
    </div>
  );
};
