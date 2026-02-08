import { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { MapLayerConfig } from '../types/config';
import L from 'leaflet';
import JSZip from 'jszip';
import { kml } from '@tmcw/togeojson';

interface MapLayerControlProps {
  map: L.Map | null;
}

// Global layers storage similar to original application
const leafletLayers: { [key: string]: L.Layer } = {};

export default function MapLayerControl({ map }: MapLayerControlProps) {
  const { state } = useApp();
  const [layerStates, setLayerStates] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    if (!state.config?.mapLayers || !map) return;

    // Initialize layer states and automatically load selected layers
    const initializeMapLayers = async () => {
      if (!state.config?.mapLayers) return;
      
      console.log('Initializing map layers:', state.config.mapLayers);
      
      const initialStates: { [key: string]: boolean } = {};
      
      for (const [key, layerConfig] of Object.entries(state.config.mapLayers)) {
        const layer = layerConfig as MapLayerConfig;
        initialStates[key] = layer.selected;
        
        console.log(`Layer ${key}: selected=${layer.selected}, file=${layer.fn}`);
        
        // If layer is selected by default, load it
        if (layer.selected) {
          console.log(`Auto-loading selected layer: ${layer.fn}`);
          await loadContextLayer(layer.fnPath, layer.fn, layer.style);
        }
      }
      
      setLayerStates(initialStates);
      console.log('Layer states initialized:', initialStates);
    };

    initializeMapLayers();
  }, [state.config?.mapLayers, map]);

  const loadContextLayer = async (fnPath: string, fileName: string, layerStyle?: any) => {
    if (!map) return;

    const defaultStyle = {
      fillOpacity: 1,
      stroke: true,
      color: 'black',
      fill: true,
      fillColor: 'white',
      weight: 1,
      radius: 4,
      ...layerStyle
    };

    const ext = fileName.split('.').pop()?.toLowerCase();

    try {
      switch (ext) {
        case 'geojson':
          const response = await fetch(fnPath);
          const geoJsonData = await response.json();
          
          // Create a standard GeoJSON layer
          const geoJsonLayer = L.geoJSON(geoJsonData, {
            style: defaultStyle,
            onEachFeature: (feature, layer) => {
              // Add any interaction handlers here if needed
              if (feature.properties) {
                const popupContent = Object.entries(feature.properties)
                  .map(([key, value]) => `<strong>${key}:</strong> ${value}`)
                  .join('<br>');
                layer.bindPopup(popupContent);
              }
            }
          });

          geoJsonLayer.addTo(map);
          leafletLayers[fileName] = geoJsonLayer;
          updateLayerZIndex();
          break;

        case 'kml':
          await loadKMLLayer(fnPath, fileName, defaultStyle);
          break;

        case 'kmz':
          await loadKMZLayer(fnPath, fileName, defaultStyle);
          break;

        default:
          console.warn(`Unsupported file format: ${ext}`);
      }
    } catch (error) {
      console.error(`Error loading layer ${fileName}:`, error);
    }
  };

  const loadKMLLayer = async (fnPath: string, fileName: string, layerStyle: any) => {
    if (!map) return;

    try {
      const response = await fetch(fnPath);
      const kmlText = await response.text();
      
      // Parse KML text to XML DOM
      const parser = new DOMParser();
      const kmlDom = parser.parseFromString(kmlText, 'text/xml');
      
      // Convert KML to GeoJSON
      const geoJsonData = kml(kmlDom);
      
      // Create a GeoJSON layer
      const kmlLayer = L.geoJSON(geoJsonData, {
        style: layerStyle,
        onEachFeature: (feature, layer) => {
          if (feature.properties) {
            const popupContent = Object.entries(feature.properties)
              .map(([key, value]) => `<strong>${key}:</strong> ${value}`)
              .join('<br>');
            layer.bindPopup(popupContent);
          }
        }
      });

      kmlLayer.addTo(map);
      leafletLayers[fileName] = kmlLayer;
      updateLayerZIndex();
    } catch (error) {
      console.error(`Error loading KML layer ${fileName}:`, error);
    }
  };

  const loadKMZLayer = async (fnPath: string, fileName: string, layerStyle: any) => {
    if (!map) return;

    console.log(`Loading KMZ layer: ${fileName} from ${fnPath}`);
    
    try {
      const response = await fetch(fnPath);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const arrayBuffer = await response.arrayBuffer();
      console.log(`KMZ file loaded, size: ${arrayBuffer.byteLength} bytes`);
      
      // Load the KMZ file using JSZip
      const zip = await JSZip.loadAsync(arrayBuffer);
      console.log(`KMZ archive opened, files:`, Object.keys(zip.files));
      
      // Find KML files in the archive (usually doc.kml or similar)
      const kmlFiles = Object.keys(zip.files).filter(filename => 
        filename.toLowerCase().endsWith('.kml')
      );
      
      console.log(`Found KML files:`, kmlFiles);
      
      if (kmlFiles.length === 0) {
        throw new Error('No KML files found in KMZ archive');
      }
      
      // Use the first KML file found (most KMZ files have one main KML)
      const kmlFile = zip.files[kmlFiles[0]];
      const kmlText = await kmlFile.async('text');
      console.log(`KML content extracted, length: ${kmlText.length}`);
      
      // Parse KML text to XML DOM
      const parser = new DOMParser();
      const kmlDom = parser.parseFromString(kmlText, 'text/xml');
      
      // Convert KML to GeoJSON
      const geoJsonData = kml(kmlDom);
      console.log(`KML converted to GeoJSON:`, geoJsonData);
      
      // Create a GeoJSON layer
      const kmzLayer = L.geoJSON(geoJsonData, {
        style: layerStyle,
        onEachFeature: (feature, layer) => {
          if (feature.properties) {
            const popupContent = Object.entries(feature.properties)
              .map(([key, value]) => `<strong>${key}:</strong> ${value}`)
              .join('<br>');
            layer.bindPopup(popupContent);
          }
        }
      });

      kmzLayer.addTo(map);
      leafletLayers[fileName] = kmzLayer;
      updateLayerZIndex();
      console.log(`KMZ layer ${fileName} successfully added to map`);
    } catch (error) {
      console.error(`Error loading KMZ layer ${fileName}:`, error);
    }
  };

  const toggleLayer = async (layerId: string) => {
    if (!map || !state.config?.mapLayers) return;

    const layerConfig = state.config.mapLayers[layerId];
    const isCurrentlyVisible = layerStates[layerId];
    const fileName = layerConfig.fn;

    if (isCurrentlyVisible) {
      // Hide/remove layer
      if (leafletLayers[fileName]) {
        map.removeLayer(leafletLayers[fileName]);
      }
    } else {
      // Show/load layer
      if (leafletLayers[fileName]) {
        // Layer already exists, just add it back
        leafletLayers[fileName].addTo(map);
      } else {
        // Layer doesn't exist, load it
        await loadContextLayer(layerConfig.fnPath, fileName, layerConfig.style);
      }
    }

    // Update state
    setLayerStates(prev => ({
      ...prev,
      [layerId]: !isCurrentlyVisible
    }));

    updateLayerZIndex();
  };

  const updateLayerZIndex = () => {
    if (!map) return;
    
    // Set overlayPane z-index high to keep controls on top
    const overlayPane = map.getPane('overlayPane');
    if (overlayPane) {
      overlayPane.style.zIndex = '1010';
    }
  };

  if (!state.config?.mapLayers) return null;

  const mapLayers = state.config.mapLayers;

  return (
    <div 
      id="floating-panel" 
      style={{
        position: 'absolute',
        bottom: '20px',
        right: '20px',
        zIndex: 10000,
        backgroundColor: '#111',
        padding: '10px',
        opacity: 0.85,
        borderRadius: '4px',
        minWidth: '200px'
      }}
    >
      <div style={{ color: 'white', marginBottom: '10px', fontWeight: 'bold' }}>
        Map Layers
      </div>
      <ul 
        id="sortable" 
        style={{
          listStyleType: 'none',
          paddingLeft: '0',
          paddingRight: '0',
          margin: '0'
        }}
      >
        {Object.entries(mapLayers).map(([layerId, layerConfig]) => {
          const layer = layerConfig as MapLayerConfig;
          return (
            <li 
              key={layerId}
              id={`li_${layer.fn}`}
              className="ui-state-default"
              style={{
                marginBottom: '8px',
                padding: '5px',
                backgroundColor: layerStates[layerId] ? 'rgb(175, 193, 126)' : 'rgba(45,78,69,0)',
                border: '1px solid #555',
                borderRadius: '2px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <span 
                className="ui-icon ui-icon-arrowthick-2-n-s" 
                style={{ 
                  marginRight: '8px',
                  color: '#ccc',
                  fontSize: '12px'
                }}
              >
                ⇕
              </span>
              <input
                type="checkbox"
                checked={layerStates[layerId] || false}
                onChange={() => toggleLayer(layerId)}
                className={layerStates[layerId] ? 'checked' : 'unchecked'}
                value={layer.fn}
                data-type="static"
                style={{ marginRight: '8px' }}
              />
              <p 
                className="key" 
                style={{ 
                  margin: '0',
                  color: 'white',
                  fontSize: '12px'
                }}
              >
                {layer.var_name}
              </p>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
