import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useApp } from '../context/AppContext';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface MapComponentProps {
  onFeatureClick?: (feature: any) => void;
}

function MapEventHandler({ onFeatureClick }: { onFeatureClick?: (feature: any) => void }) {
  const map = useMap();
  const { state } = useApp();

  useEffect(() => {
    if (!state.config) return;

    // Initialize map layers and markers based on config
    const initializeMapLayers = async () => {
      // This will be expanded to handle different layer types
      // based on the original markerPlot.js and 2dMap.js logic
    };

    initializeMapLayers();
  }, [map, state.config, onFeatureClick]);

  return null;
}

export default function MapComponent({ onFeatureClick }: MapComponentProps) {
  const mapRef = useRef<L.Map | null>(null);

  return (
    <div style={{ height: '100%', width: '100%', position: 'absolute', zIndex: 0 }}>
      <MapContainer
        center={[39.8283, -98.5795]} // Default center (US)
        zoom={4}
        style={{ height: '100%', width: '100%' }}
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapEventHandler onFeatureClick={onFeatureClick} />
      </MapContainer>
    </div>
  );
}
