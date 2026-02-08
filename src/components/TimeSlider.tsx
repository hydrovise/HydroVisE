import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { usePlot } from '../context/PlotContext';

interface TimeSliderProps {
  onSliderChange: (value: number) => void;
}

export default function TimeSlider({ onSliderChange }: TimeSliderProps) {
  const { state, dispatch } = useApp();
  const { plotOperations } = usePlot();
  const [sliderValue, setSliderValue] = useState(0);
  const [sliderLabel, setSliderLabel] = useState('');
  const sliderRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!state.config?.timeSlider) return;

    const config = state.config.timeSlider;
    setSliderValue(config.value);
    
    // Initialize label
    if (config.label) {
      try {
        const labelFunction = new Function(config.label.arguments, config.label.body);
        setSliderLabel(labelFunction(config.value));
      } catch (error) {
        console.warn('Error creating label function:', error);
        setSliderLabel(String(config.value));
      }
    }
  }, [state.config]);

  const handleSliderInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value);
    setSliderValue(value);
    
    // Update label during slide (like the original slide function)
    if (state.config?.timeSlider?.label) {
      try {
        const labelFunction = new Function(
          state.config.timeSlider.label.arguments,
          state.config.timeSlider.label.body
        );
        setSliderLabel(labelFunction(value));
      } catch (error) {
        setSliderLabel(String(value));
      }
    }
  };

  const handleSliderStop = () => {
    // Update system state when slider stops (like the original stop function)
    dispatch({
      type: 'UPDATE_SYSTEM_STATE',
      payload: { sliderState: sliderValue }
    });
    
    // Call the callback for any additional functionality
    onSliderChange(sliderValue);
    
    // Clear temporary traces and add new ones (like original)
    if (plotOperations.current) {
      plotOperations.current.clearTraces('temporary');
      plotOperations.current.addTraces('temporary');
    }
  };

  const addTraces = (lifespan: string = 'semi-permanent') => {
    console.log(`Add traces clicked with lifespan: ${lifespan}`);
    if (plotOperations.current) {
      plotOperations.current.addTraces(lifespan);
    }
  };

  const clearTraces = (lifespan: string = 'semi-permanent') => {
    console.log(`Clear traces clicked with lifespan: ${lifespan}`);
    if (plotOperations.current) {
      plotOperations.current.clearTraces(lifespan);
    }
  };

  if (!state.config?.timeSlider) return null;

  const config = state.config.timeSlider;
  
  return (
    <>
      <div id="slider" style={{ width: 'calc(30%)', float: 'left' }}>
        <input
          ref={sliderRef}
          type="range"
          min={config.min}
          max={config.max}
          step={config.step}
          value={sliderValue}
          onChange={handleSliderInput}
          onMouseUp={handleSliderStop}
          onTouchEnd={handleSliderStop}
          style={{ 
            width: '100%',
            height: '20px',
            background: '#ddd',
            outline: 'none',
            opacity: 0.7,
            transition: 'opacity 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.opacity = '1'}
          onMouseOut={(e) => e.currentTarget.style.opacity = '0.7'}
        />
      </div>
      <input 
        className="button-slider" 
        type="button" 
        value="add" 
        onClick={() => addTraces('semi-permanent')}
      />
      <input 
        className="button-slider" 
        type="button" 
        value="clear" 
        onClick={() => clearTraces('semi-permanent')}
      />
      <div id="sliderLabelDIV">
        {sliderLabel}
      </div>
    </>
  );
}
