import { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import MapComponent from './components/MapComponent';
import PlotComponent from './components/PlotComponent';
import ControlPanel from './components/ControlPanel';
import TimeSlider from './components/TimeSlider';
import { SimpleTimeSlider } from './components/SimpleTimeSlider';
import InventoryPanel from './components/InventoryPanel';
import LoadingBar from './components/LoadingBar';
import EventMetricsPanel from './components/SimpleEventMetricsPanel';
import SpatialDataAnimation from './components/SimpleSpatialDataAnimation';
import ModMethodController from './components/SimpleModMethodController';
import ErrorBoundary, { AsyncErrorBoundary } from './components/ErrorBoundary';
import { loadConfig, getConfigUrl, checkXRange } from './utils/config';

function AppContent() {
  const { state, dispatch } = useApp();
  const [plotVisible, setPlotVisible] = useState(false);
  const [inventoryVisible, setInventoryVisible] = useState(false);
  const [eventMetricsVisible, setEventMetricsVisible] = useState(false);
  const [animationVisible, setAnimationVisible] = useState(false);
  const [modMethodVisible, setModMethodVisible] = useState(false);
  const [useEnhancedTimeSlider, setUseEnhancedTimeSlider] = useState(false);
  const [useWebGLRendering, setUseWebGLRendering] = useState(false);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        
        const configUrl = getConfigUrl();
        const config = await loadConfig(configUrl);
        
        dispatch({ type: 'SET_CONFIG', payload: config });
        
        // Set document title
        if (config.page?.title) {
          document.title = config.page.title;
        }
        
        dispatch({ type: 'SET_LOADING', payload: false });
      } catch (error) {
        console.error('Failed to initialize app:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to load configuration';
        dispatch({ type: 'SET_ERROR', payload: errorMessage });
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    initializeApp();
  }, [dispatch]);

  const handleYearChange = (direction: number) => {
    if (!state.config) return;
    
    const currentYear = Number(state.systemState.yr);
    const newYear = currentYear + direction;
    
    // Check bounds
    if (newYear >= state.config.data_part.min_val && newYear <= state.config.data_part.max_val) {
      dispatch({
        type: 'UPDATE_SYSTEM_STATE',
        payload: {
          yr: newYear,
          xRange: checkXRange(newYear)
        }
      });
    }
  };

  const handlePlotToggle = () => {
    setPlotVisible(!plotVisible);
  };

  const handleSliderChange = (value: number) => {
    dispatch({
      type: 'UPDATE_SYSTEM_STATE',
      payload: { sliderState: value }
    });
  };

  const handleFeatureClick = (feature: any) => {
    if (!state.config?.mapMarkers) return;
    
    const comID = feature.properties[state.config.mapMarkers.comIDName];
    dispatch({
      type: 'UPDATE_SYSTEM_STATE',
      payload: { comID }
    });
    
    setPlotVisible(true);
  };

  if (state.loading) {
    return <LoadingBar />;
  }

  if (state.error) {
    return (
      <div style={{ 
        position: 'absolute', 
        top: '50%', 
        left: '50%', 
        transform: 'translate(-50%, -50%)',
        color: 'white',
        textAlign: 'center'
      }}>
        <h2>Error Loading HydroVisE</h2>
        <p>{state.error}</p>
      </div>
    );
  }

  if (!state.config) {
    return null;
  }

  return (
    <div style={{ height: '100%', width: '100%', position: 'relative' }}>
      {/* WebGL rendering disabled for now - needs more complex integration */}
      {useWebGLRendering && (
        <div style={{
          position: 'absolute',
          top: '10px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(0, 123, 255, 0.9)',
          color: 'white',
          padding: '8px 16px',
          borderRadius: '4px',
          fontSize: '12px',
          zIndex: 1001
        }}>
          WebGL rendering mode enabled (experimental)
        </div>
      )}
      
      {/* Map Container */}
      <MapComponent onFeatureClick={handleFeatureClick} />
      
      {/* Control Panels */}
      <ControlPanel 
        onYearChange={handleYearChange}
        onPlotToggle={handlePlotToggle}
      />
      
      {/* Advanced Controls Toggle */}
      <div style={{
        position: 'absolute',
        top: '10px',
        right: '10px',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        gap: '5px'
      }}>
        <button
          onClick={() => setEventMetricsVisible(!eventMetricsVisible)}
          style={{
            padding: '8px 12px',
            backgroundColor: eventMetricsVisible ? '#007bff' : '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px'
          }}
        >
          Event Metrics
        </button>
        <button
          onClick={() => setAnimationVisible(!animationVisible)}
          style={{
            padding: '8px 12px',
            backgroundColor: animationVisible ? '#007bff' : '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px'
          }}
        >
          Animation
        </button>
        <button
          onClick={() => setModMethodVisible(!modMethodVisible)}
          style={{
            padding: '8px 12px',
            backgroundColor: modMethodVisible ? '#007bff' : '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px'
          }}
        >
          Mod Methods
        </button>
        <button
          onClick={() => setUseEnhancedTimeSlider(!useEnhancedTimeSlider)}
          style={{
            padding: '8px 12px',
            backgroundColor: useEnhancedTimeSlider ? '#007bff' : '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px'
          }}
        >
          Enhanced Slider
        </button>
        <button
          onClick={() => setUseWebGLRendering(!useWebGLRendering)}
          style={{
            padding: '8px 12px',
            backgroundColor: useWebGLRendering ? '#007bff' : '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px'
          }}
        >
          WebGL
        </button>
      </div>
      
      {/* Time Slider */}
      {state.config?.timeSlider && (
        useEnhancedTimeSlider ? (
          <SimpleTimeSlider 
            min={0}
            max={100}
            value={Number(state.systemState.sliderState) || 0}
            onValueChange={handleSliderChange}
            label="Enhanced Time Control"
          />
        ) : (
          <TimeSlider onSliderChange={handleSliderChange} />
        )
      )}
      
      {/* Plot Component */}
      <PlotComponent 
        isVisible={plotVisible}
        onToggle={handlePlotToggle}
      />
      
      {/* Inventory Panel */}
      <InventoryPanel 
        isVisible={inventoryVisible}
        onToggle={() => setInventoryVisible(!inventoryVisible)}
      />
      
      {/* Event Metrics Panel */}
      {eventMetricsVisible && (
        <div style={{
          position: 'absolute',
          top: '100px',
          right: '220px',
          zIndex: 1000,
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
          border: '1px solid #444',
          borderRadius: '4px'
        }}>
          <EventMetricsPanel />
        </div>
      )}
      
      {/* Spatial Data Animation */}
      {animationVisible && state.config?.spatialData && (
        <div style={{
          position: 'absolute',
          top: '200px',
          right: '220px',
          zIndex: 1000,
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
          border: '1px solid #444',
          borderRadius: '4px'
        }}>
          <SpatialDataAnimation 
            spatialDataKey={Object.keys(state.config.spatialData)[0]}
          />
        </div>
      )}
      
      {/* Mod Method Controller */}
      {modMethodVisible && (
        <div style={{
          position: 'absolute',
          top: '300px',
          right: '220px',
          zIndex: 1000,
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
          border: '1px solid #444',
          borderRadius: '4px'
        }}>
          <ModMethodController />
        </div>
      )}
    </div>
  );
}

function App() {
  return (
    <AsyncErrorBoundary>
      <AppProvider>
        <ErrorBoundary>
          <AppContent />
        </ErrorBoundary>
      </AppProvider>
    </AsyncErrorBoundary>
  );
}

export default App;
