import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useApp } from '../context/AppContext';
import MapInventory from './MapInventory';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface MapComponentProps {
  onFeatureClick?: (feature: any) => void;
  onMapReady?: (map: L.Map) => void;
}

function MapEventHandler({ onFeatureClick, onMapReady }: { onFeatureClick?: (feature: any) => void; onMapReady?: (map: L.Map) => void }) {
  const map = useMap();
  const { state } = useApp();

  // Notify parent when map is ready
  useEffect(() => {
    if (map && onMapReady) {
      onMapReady(map);
    }
  }, [map, onMapReady]);

  useEffect(() => {
    if (!state.config) return;

    // Storage for map layers and markers
    const mapObjects: { [key: string]: L.Layer } = {};

    // Load map markers from GeoJSON
    const loadMapMarkers = async () => {
      if (!map || !state.config?.mapMarkers) return;

      try {
        const { mapMarkers } = state.config;
        const markerPath = mapMarkers.fnPath;

        if (!markerPath) {
          console.error('No valid path for markers found in config');
          return;
        }

        console.log('Loading map markers from:', markerPath);

        // Fetch GeoJSON data
        const response = await fetch(markerPath);
        if (!response.ok) {
          throw new Error(`Failed to load markers: ${response.status} ${response.statusText}`);
        }

        const geoJsonData = await response.json();
        console.log('Markers loaded:', geoJsonData);

        // Remove existing markers layer if any
        if (mapObjects['markers']) {
          map.removeLayer(mapObjects['markers']);
        }

        // Create markers layer with styling and interactions
        const markersLayer = L.geoJSON(geoJsonData, {
          pointToLayer: (_feature, latlng) => {
            // Default styling for markers
            const markerStyle = {
              radius: 8,
              fillColor: '#ff7800',
              color: '#000',
              weight: 1,
              opacity: 1,
              fillOpacity: 0.8,
              ...(mapMarkers.style || {})
            };
            return L.circleMarker(latlng, markerStyle);
          },
          onEachFeature: (geoJsonFeature, layer) => {
            // Add popup with feature properties
            if (geoJsonFeature.properties) {
              const comID = geoJsonFeature.properties[mapMarkers.comIDName];

              // Create tooltip content if tooltip template exists
              let tooltipContent = '';
              if (mapMarkers.tooltip?.template) {
                const { var: vars, format } = mapMarkers.tooltip.template;
                const values = vars.map(varName => {
                  if (varName === 'metric' || varName === 'metricName') {
                    // These would require additional handling with systemState
                    return 'N/A';
                  }
                  return geoJsonFeature.properties?.[varName] || '';
                });

                // Simple string format function
                tooltipContent = format.replace(/{(\d+)}/g, (match, index) => {
                  return values[index] !== undefined ? values[index] : match;
                });
              }

              // Bind popup with formatted content
              layer.bindTooltip(tooltipContent || String(comID));

              // Add click handler
              if (mapMarkers.onEachFeature?.click === 'clickFeature') {
                layer.on('click', () => {
                  if (onFeatureClick) {
                    onFeatureClick(geoJsonFeature);
                  }
                });
              }
            }
          }
        });

        // Add markers to map
        markersLayer.addTo(map);
        mapObjects['markers'] = markersLayer;

      } catch (error) {
        console.error('Error loading map markers:', error);
      }
    };

    // Initialize map layers and markers based on config
    const initializeMapLayers = async () => {
      // Load map markers if defined in config
      if (state.config?.mapMarkers) {
        await loadMapMarkers();
      }
    };

    initializeMapLayers();
  }, [map, state.config, onFeatureClick]);

  return (
    <>
      <MapInventory map={map} />
    </>
  );
}

export default function MapComponent({ onFeatureClick, onMapReady }: MapComponentProps) {
  const mapRef = useRef<L.Map | null>(null);

  const handleMapReady = (map: L.Map) => {
    mapRef.current = map;
    if (onMapReady) {
      onMapReady(map);
    }
  };

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
        <MapEventHandler onFeatureClick={onFeatureClick} onMapReady={handleMapReady} />
      </MapContainer>
    </div>
  );
}
