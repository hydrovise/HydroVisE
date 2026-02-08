import { useApp } from '../context/AppContext';
interface ControlPanelProps {
  onYearChange: (direction: number) => void;
  onPlotToggle: () => void;
}
export default function ControlPanel({ onYearChange, onPlotToggle }: ControlPanelProps) {
  const { state, dispatch } = useApp();
  if (!state.config) return null;
  const currentYear = state.systemState.yr;
  const handleAttributeChange = (value: string) => {
    dispatch({
      type: 'UPDATE_SYSTEM_STATE',
      payload: { prod: value }
    });
  };
  return (
    <>
      {/* Year Control Bar */}
      <div className="generic-control-bar year-control-bar">
        <div
          className="year-button"
          onClick={() => onYearChange(-1)}
          data-value="-1"
        >
          -
        </div>
        <div id="year-selected" className="year-button" data-year={currentYear}>
          {currentYear}
        </div>
        <div
          className="year-button"
          onClick={() => onYearChange(1)}
          data-value="1"
        >
          +
        </div>
      </div>
      {/* Plot Control Bar */}
      <div className="plot-control-bar">
        <div id="plotly-button" className="generic-button" onClick={onPlotToggle}>
          <img src="/dist/images/plot_ico.svg" alt="Plot" />
        </div>
      </div>
      {/* Custom Control Container */}
      <div className="custom-control-container">
        {/* Attributes Dropdown */}
        <div className="metricTypeDIV">
          <div
            id="markerAttrs"
            className="baseMapControl"
            onClick={() => {
              const options = document.getElementById('markerAttrsOptions');
              if (options) {
                options.style.display = options.style.display === 'block' ? 'none' : 'block';
              }
            }}
          >
            Attributes
            <img className="dropDownArrow" src="http://maps.gstatic.com/mapfiles/arrow-down.png" alt="dropdown" />
          </div>
          <div id="markerAttrsOptions" className="baseMapTypeOptions">
            {state.config.traces && Object.entries(state.config.traces).map(([key, trace]) => (
              <div
                key={key}
                onClick={() => handleAttributeChange(trace.prod)}
                style={{ padding: '5px', cursor: 'pointer' }}
              >
                {trace.style.name}
              </div>
            ))}
          </div>
        </div>
        {/* Simulation Type Dropdown */}
        <div className="simTypeDIV">
          <div
            id="prod"
            className="baseMapControl"
            onClick={() => {
              const options = document.getElementById('prodOptions');
              if (options) {
                options.style.display = options.style.display === 'block' ? 'none' : 'block';
              }
            }}
          >
            Sim. Type
            <img className="dropDownArrow" src="http://maps.gstatic.com/mapfiles/arrow-down.png" alt="dropdown" />
          </div>
          <div id="prodOptions" className="baseMapTypeOptions">
            {/* Simulation type options will be populated based on config */}
          </div>
        </div>
        {/* Base Map Dropdown */}
        <div className="baseMapDIV">
          <div
            id="baseMapType"
            className="baseMapControl"
            onClick={() => {
              const options = document.getElementById('baseMapTypeOptions');
              if (options) {
                options.style.display = options.style.display === 'block' ? 'none' : 'block';
              }
            }}
          >
            Base Map
            <img className="dropDownArrow" src="http://maps.gstatic.com/mapfiles/arrow-down.png" alt="dropdown" />
          </div>
          <div id="baseMapTypeOptions" className="baseMapTypeOptions">
            <div style={{ padding: '5px', cursor: 'pointer' }}>OpenStreetMap</div>
            <div style={{ padding: '5px', cursor: 'pointer' }}>Satellite</div>
          </div>
        </div>
        {/* Calculate Metrics Button */}
        <button
          id="calculatemetricsButton"
          disabled={true}
          onClick={() => {
            // Calculate event metrics functionality
            console.log('Calculate Event Metrics clicked');
          }}
        >
          Calculate Event <br />Metrics
        </button>
      </div>
    </>
  );
}