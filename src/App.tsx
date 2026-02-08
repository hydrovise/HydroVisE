import { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import { AppProvider, useApp } from './context/AppContext';
import { PlotProvider } from './context/PlotContext';
import MapComponent from './components/MapComponent';
import PlotComponent from './components/PlotComponent';
// import ControlPanel from './components/ControlPanel';
import TimeSlider from './components/TimeSlider';
import { SimpleTimeSlider } from './components/SimpleTimeSlider';
import InventoryPanel from './components/InventoryPanel';
import LoadingBar from './components/LoadingBar';
import EventMetricsPanel from './components/SimpleEventMetricsPanel';
import SpatialDataAnimation from './components/SimpleSpatialDataAnimation';
import ModMethodController from './components/SimpleModMethodController';
import ErrorBoundary, { AsyncErrorBoundary } from './components/ErrorBoundary';
import { loadConfig, getConfigUrl, checkXRange } from './utils/config';
import './styles/hydrovise.css';
function AppContent() {
  const { state, dispatch } = useApp();
  const [plotVisible, setPlotVisible] = useState(false);
  const [inventoryVisible, setInventoryVisible] = useState(false);
  const [eventMetricsVisible, setEventMetricsVisible] = useState(false);
  const [animationVisible, setAnimationVisible] = useState(false);
  const [modMethodVisible, setModMethodVisible] = useState(false);
  const [useEnhancedTimeSlider, setUseEnhancedTimeSlider] = useState(false);
  const [useWebGLRendering, setUseWebGLRendering] = useState(false);
  const [mapInstance, setMapInstance] = useState<L.Map | null>(null);
  // Refs for draggable functionality
  const inventoryTitleRef = useRef<HTMLDivElement>(null);
  const inventoryRef = useRef<HTMLDivElement>(null);

  // Drag state
  const dragStateRef = useRef({
    isDragging: false,
    startX: 0,
    startY: 0,
    initialLeft: 0,
    initialTop: 0
  });
  // Drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const element = inventoryRef.current;
    if (!element) return;

    const rect = element.getBoundingClientRect();
    const computedStyle = window.getComputedStyle(element);

    dragStateRef.current = {
      isDragging: true,
      startX: e.clientX,
      startY: e.clientY,
      initialLeft: parseInt(computedStyle.left) || rect.left,
      initialTop: parseInt(computedStyle.top) || rect.top
    };
    // Ensure element has absolute positioning
    if (computedStyle.position !== 'absolute' && computedStyle.position !== 'fixed') {
      element.style.position = 'absolute';
      element.style.left = rect.left + 'px';
      element.style.top = rect.top + 'px';
    }

    // Add visual feedback
    element.style.zIndex = '9999';
    element.style.opacity = '0.9';
    if (inventoryTitleRef.current) {
      inventoryTitleRef.current.style.cursor = 'grabbing';
      inventoryTitleRef.current.style.backgroundColor = '#0f1f1d'; // Darker background while dragging
    }
  };
  const handleMouseMove = (e: MouseEvent) => {
    if (!dragStateRef.current.isDragging) return;

    e.preventDefault();
    e.stopPropagation();

    const element = inventoryRef.current;
    if (!element) return;

    const deltaX = e.clientX - dragStateRef.current.startX;
    const deltaY = e.clientY - dragStateRef.current.startY;

    const newLeft = dragStateRef.current.initialLeft + deltaX;
    const newTop = dragStateRef.current.initialTop + deltaY;

    // Boundary constraints
    const maxLeft = Math.max(0, window.innerWidth - element.offsetWidth);
    const maxTop = Math.max(0, window.innerHeight - element.offsetHeight);

    const constrainedLeft = Math.max(0, Math.min(newLeft, maxLeft));
    const constrainedTop = Math.max(0, Math.min(newTop, maxTop));

    element.style.left = constrainedLeft + 'px';
    element.style.top = constrainedTop + 'px';
  };
  const handleMouseUp = (e: MouseEvent) => {
    if (dragStateRef.current.isDragging) {
      e.preventDefault();
      e.stopPropagation();

      const element = inventoryRef.current;
      if (element) {
        element.style.zIndex = '30'; // Reset to original z-index
        element.style.opacity = '1'; // Reset opacity
      }
      if (inventoryTitleRef.current) {
        inventoryTitleRef.current.style.cursor = 'move';
        inventoryTitleRef.current.style.backgroundColor = '#162d2b'; // Reset to original background
      }
    }
    dragStateRef.current.isDragging = false;
  };
  // Setup global mouse listeners
  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);
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
  const handleMapReady = (map: L.Map) => {
    setMapInstance(map);
  };
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      console.log('File uploaded:', file.name, file.type);
      // In a full implementation, this would process the uploaded file
      // and add it as a new layer to the map
    }
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
      {/* Progress Bar */}
      <div id="progressDIV" style={{ display: state.loading ? 'block' : 'none' }}>
        <div className="bgLoading" style={{ width: '10%' }}>Loading...</div>
      </div>
      {/* Map Container - Full screen background */}
      <div id="map-container">
        <MapComponent
          onFeatureClick={handleFeatureClick}
          onMapReady={handleMapReady}
        />
      </div>
      {/* Colorbar - Left side */}
      <div id="colorbar">
        {/* Colorbar content will be populated by map component */}
      </div>
      {/* 2D Colorbar - Right side */}
      <div id="twodcolorbar">
        <i id='hide2dLegend' className='fa fa-chevron-circle-right'></i>
        {/* 2D colorbar content */}
      </div>
      <i id='show2dLegend' className='fa fa-chevron-circle-left' style={{ display: 'none' }}></i>
      {/* Plot Container - matches original div_plot positioning */}
      <div id="div_plot" className={plotVisible ? 'visible' : ''}>
        <PlotComponent
          isVisible={plotVisible}
          onToggle={handlePlotToggle}
        />

        {/* Slider Container - Only render if timeSlider exists in config */}
        {state.config?.timeSlider && (
          <div id="sliderMainDIV" className={plotVisible ? 'visible' : ''}>
            {useEnhancedTimeSlider ? (
              <SimpleTimeSlider
                min={0}
                max={100}
                value={Number(state.systemState.sliderState) || 0}
                onValueChange={handleSliderChange}
                label="Enhanced Time Control"
              />
            ) : (
              <TimeSlider onSliderChange={handleSliderChange} />
            )}
          </div>
        )}
      </div>
      {/* Year Control Bar - Top right */}
      <div className="generic-control-bar year-control-bar">
        <div className="year-button" onClick={() => handleYearChange(-1)}>-</div>
        <div id="year-selected" className="year-button">
          {state.systemState.yr}
        </div>
        <div className="year-button" onClick={() => handleYearChange(1)}>+</div>
      </div>
      {/* Plot Control Bar - Below year controls */}
      <div className="plot-control-bar">
        <div className="generic-button" onClick={handlePlotToggle}>
          <img src="/dist/images/plot_ico.png" alt="Plot" style={{ width: '20px', height: '20px' }} />
        </div>
        <div className="generic-button" onClick={() => setInventoryVisible(!inventoryVisible)}>
          <img src="/dist/images/inventory_ico.png" alt="Inventory" style={{ width: '20px', height: '20px' }} />
        </div>
      </div>
      {/* Custom Control Container - Right side dropdowns */}
      <div className="custom-control-container">
        <div className="metricTypeDIV">
          <div className="baseMapControl">
            Attributes
            <img className="dropDownArrow" src="http://maps.gstatic.com/mapfiles/arrow-down.png" alt="" />
          </div>
          <div className="baseMapTypeOptions">
            {/* Attributes options */}
          </div>
        </div>

        <div className="simTypeDIV">
          <div className="baseMapControl">
            Sim. Type
            <img className="dropDownArrow" src="http://maps.gstatic.com/mapfiles/arrow-down.png" alt="" />
          </div>
          <div className="baseMapTypeOptions">
            {/* Simulation type options */}
          </div>
        </div>

        <div className="baseMapDIV">
          <div className="baseMapControl">
            Base Map
            <img className="dropDownArrow" src="http://maps.gstatic.com/mapfiles/arrow-down.png" alt="" />
          </div>
          <div className="baseMapTypeOptions">
            {/* Base map options */}
          </div>
        </div>

        <button
          id="claculatemetricsButton"
          disabled={true}
          style={{
            marginTop: '10px',
            padding: '8px 12px',
            backgroundColor: '#ccc',
            border: '1px solid #999',
            cursor: 'not-allowed',
            color: 'black'
          }}
        >
          Calculate Event <br />Metrics
        </button>
      </div>
      <div
        id="con0"
        className={inventoryVisible ? '' : 'hidden'}
        ref={inventoryRef}
        onMouseDown={(e) => e.stopPropagation()}
        onMouseMove={(e) => e.stopPropagation()}
        onMouseUp={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
        onDoubleClick={(e) => e.stopPropagation()}
      >
        <div
          id="title_con0"
          ref={inventoryTitleRef}
          style={{ cursor: 'move' }}
          onMouseDown={handleMouseDown}
        >
          Map Inventory
          <button
            onClick={() => setInventoryVisible(false)}
            style={{
              position: 'absolute',
              right: '5px',
              top: '5px',
              background: 'transparent',
              border: 'none',
              color: 'white',
              cursor: 'pointer',
              fontSize: '16px',
              lineHeight: '20px'
            }}
          >
            ×
          </button>
        </div>
        <div className="legend">
          <InventoryPanel
            isVisible={inventoryVisible}
            onToggle={() => setInventoryVisible(!inventoryVisible)}
            map={mapInstance}
          />
        </div>
        <div style={{
          width: '100%',
          display: 'block',
          textAlign: 'center',
          padding: '10px',
          borderTop: '1px solid #ddd'
        }}>
          <input
            type="file"
            id="drop"
            accept=".geojson,.kml,.kmz,.json"
            onChange={handleFileUpload}
            style={{
              display: 'block',
              width: '100%',
              maxWidth: 'none',
              padding: '5px',
              border: '1px solid #ccc',
              borderRadius: '3px',
              backgroundColor: '#f9f9f9'
            }}
          />
          <label
            htmlFor="drop"
            style={{
              display: 'block',
              marginTop: '5px',
              fontSize: '12px',
              color: '#666'
            }}
          >
            Upload GeoJSON, KML, or KMZ files
          </label>
        </div>
      </div>
      {/* Advanced Controls - Moved to less prominent position */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        right: '20px',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        gap: '5px'
      }}>
        <button
          onClick={() => setEventMetricsVisible(!eventMetricsVisible)}
          style={{
            padding: '6px 10px',
            backgroundColor: eventMetricsVisible ? '#007bff' : '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '3px',
            cursor: 'pointer',
            fontSize: '11px'
          }}
        >
          Event Metrics
        </button>
        <button
          onClick={() => setAnimationVisible(!animationVisible)}
          style={{
            padding: '6px 10px',
            backgroundColor: animationVisible ? '#007bff' : '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '3px',
            cursor: 'pointer',
            fontSize: '11px'
          }}
        >
          Animation
        </button>
        <button
          onClick={() => setModMethodVisible(!modMethodVisible)}
          style={{
            padding: '6px 10px',
            backgroundColor: modMethodVisible ? '#007bff' : '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '3px',
            cursor: 'pointer',
            fontSize: '11px'
          }}
        >
          Mod Methods
        </button>
        <button
          onClick={() => setUseEnhancedTimeSlider(!useEnhancedTimeSlider)}
          style={{
            padding: '6px 10px',
            backgroundColor: useEnhancedTimeSlider ? '#007bff' : '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '3px',
            cursor: 'pointer',
            fontSize: '11px'
          }}
        >
          Enhanced Slider
        </button>
        <button
          onClick={() => setUseWebGLRendering(!useWebGLRendering)}
          style={{
            padding: '6px 10px',
            backgroundColor: useWebGLRendering ? '#007bff' : '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '3px',
            cursor: 'pointer',
            fontSize: '11px'
          }}
        >
          WebGL
        </button>
      </div>
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
      {/* WebGL rendering indicator */}
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
    </div>
  );
}
function App() {
  return (
    <AsyncErrorBoundary>
      <AppProvider>
        <PlotProvider>
          <ErrorBoundary>
            <AppContent />
          </ErrorBoundary>
        </PlotProvider>
      </AppProvider>
    </AsyncErrorBoundary>
  );
}
export default App;