import { useEffect, useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { MapLayerConfig } from '../types/config';
import L from 'leaflet';
import JSZip from 'jszip';
import { kml } from '@tmcw/togeojson';

interface MapInventoryProps {
  map: L.Map | null;
}

interface LayerItem {
  id: string;
  config: MapLayerConfig;
  visible: boolean;
  zIndex: number;
  className: string;
}

// Global layers storage
const leafletLayers: { [key: string]: L.Layer } = {};

export default function MapInventory({ map }: MapInventoryProps) {
  const { state } = useApp();
  const [layers, setLayers] = useState<LayerItem[]>([]);
  const miniConRef = useRef<HTMLDivElement>(null);
  const conRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!state.config?.mapLayers || !map) return;

    // Initialize layers from config
    const initialLayers: LayerItem[] = Object.entries(state.config.mapLayers).map(
      ([key, layerConfig], index) => ({
        id: key,
        config: layerConfig as MapLayerConfig,
        visible: (layerConfig as MapLayerConfig).selected,
        zIndex: index + 1,
        className: (layerConfig as MapLayerConfig).selected ? 'checked' : 'unchecked'
      })
    );

    setLayers(initialLayers);

    // Load initially selected layers
    initialLayers.forEach(async (layer) => {
      if (layer.visible) {
        await loadLayer(layer.config.fnPath, layer.config.fn, layer.config.style, layer.zIndex);
      }
    });
  }, [state.config?.mapLayers, map]);

  // Initialize drag functionality after component mounts
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Use setTimeout to ensure elements are in DOM
      setTimeout(() => {
        dragElement('mini_con0', 'mini_con0');
      }, 100);
    }
  }, []);

  // Implement dragElement function from JavaScript version
  const dragElement = (el_id: string, ctrl_id?: string) => {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    let init_y: string, init_x: string;
    
    const dragMouseDown = (e: MouseEvent) => {
      e = e || window.event;
      e.preventDefault();
      pos3 = e.clientX;
      pos4 = e.clientY;
      const ctrl = document.getElementById(ctrl_id || el_id);
      if (ctrl) {
        init_y = ctrl.style.top;
        init_x = ctrl.style.left;
      }
      document.onmouseup = closeDragElement;
      document.onmousemove = elementDrag;
    };

    const elementDrag = (e: MouseEvent) => {
      e = e || window.event;
      e.preventDefault();
      pos1 = pos3 - e.clientX;
      pos2 = pos4 - e.clientY;
      pos3 = e.clientX;
      pos4 = e.clientY;
      const ctrl = document.getElementById(ctrl_id || el_id);
      if (ctrl) {
        ctrl.style.top = (ctrl.offsetTop - pos2) + "px";
        ctrl.style.left = (ctrl.offsetLeft - pos1) + "px";
      }
    };

    const closeDragElement = () => {
      const ctrl = document.getElementById(ctrl_id || el_id);
      if (ctrl) {
        const final_x = ctrl.style.left;
        const final_y = ctrl.style.top;
        if (final_x === init_x && final_y === init_y) {
          minMaxInventory(ctrl_id || el_id);
        }
      }
      document.onmouseup = null;
      document.onmousemove = null;
    };

    const elmnt = document.getElementById(el_id);
    if (elmnt) {
      elmnt.onmousedown = dragMouseDown;
    }
  };

  // Implement minMaxInventory function from JavaScript version
  const minMaxInventory = (a: string) => {
    const vis = new Map([
      ['block', 'none'],
      ['none', 'block']
    ]);
    const pref = 'mini_';
    const b = a.includes(pref) ? a.replace(pref, '') : pref + a;
    const el_a = document.getElementById(a);
    const el_b = document.getElementById(b);
    
    if (el_a && el_b) {
      const currentDisplay = el_a.style.display || 'block';
      const newDisplay = vis.get(currentDisplay) || 'block';
      el_a.style.display = newDisplay;
      el_b.style.display = newDisplay;
      el_b.style.top = el_a.style.top;
      el_b.style.left = el_a.style.left;
    }
  };

  const loadLayer = async (fnPath: string, fileName: string, layerStyle?: any, zIndex: number = 1) => {
    if (!map) return;

    const defaultStyle = {
      fillOpacity: 0.7,
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
      let layer: L.Layer;

      switch (ext) {
        case 'geojson':
          layer = await loadGeoJSONLayer(fnPath, defaultStyle);
          break;
        case 'kml':
          layer = await loadKMLLayer(fnPath, defaultStyle);
          break;
        case 'kmz':
          layer = await loadKMZLayer(fnPath, defaultStyle);
          break;
        default:
          console.warn(`Unsupported file format: ${ext}`);
          return;
      }

      // Set z-index based on layer order
      if (layer && 'setZIndex' in layer && typeof layer.setZIndex === 'function') {
        (layer as any).setZIndex(1000 + zIndex);
      }

      layer.addTo(map);
      leafletLayers[fileName] = layer;
    } catch (error) {
      console.error(`Error loading layer ${fileName}:`, error);
    }
  };

  const loadGeoJSONLayer = async (fnPath: string, style: any): Promise<L.Layer> => {
    const response = await fetch(fnPath);
    const geoJsonData = await response.json();
    
    return L.geoJSON(geoJsonData, {
      style,
      onEachFeature: (feature, layer) => {
        if (feature.properties) {
          const popupContent = Object.entries(feature.properties)
            .map(([key, value]) => `<strong>${key}:</strong> ${value}`)
            .join('<br>');
          layer.bindPopup(popupContent);
        }
      }
    });
  };

  const loadKMLLayer = async (fnPath: string, style: any): Promise<L.Layer> => {
    const response = await fetch(fnPath);
    const kmlText = await response.text();
    const parser = new DOMParser();
    const kmlDom = parser.parseFromString(kmlText, 'text/xml');
    const geoJsonData = kml(kmlDom);
    
    return L.geoJSON(geoJsonData, {
      style,
      onEachFeature: (feature, layer) => {
        if (feature.properties) {
          const popupContent = Object.entries(feature.properties)
            .map(([key, value]) => `<strong>${key}:</strong> ${value}`)
            .join('<br>');
          layer.bindPopup(popupContent);
        }
      }
    });
  };

  const loadKMZLayer = async (fnPath: string, style: any): Promise<L.Layer> => {
    const response = await fetch(fnPath);
    const arrayBuffer = await response.arrayBuffer();
    const zip = await JSZip.loadAsync(arrayBuffer);
    
    const kmlFiles = Object.keys(zip.files).filter(filename => 
      filename.toLowerCase().endsWith('.kml')
    );
    
    if (kmlFiles.length === 0) {
      throw new Error('No KML files found in KMZ archive');
    }
    
    const kmlFile = zip.files[kmlFiles[0]];
    const kmlText = await kmlFile.async('text');
    const parser = new DOMParser();
    const kmlDom = parser.parseFromString(kmlText, 'text/xml');
    const geoJsonData = kml(kmlDom);
    
    return L.geoJSON(geoJsonData, {
      style,
      onEachFeature: (feature, layer) => {
        if (feature.properties) {
          const popupContent = Object.entries(feature.properties)
            .map(([key, value]) => `<strong>${key}:</strong> ${value}`)
            .join('<br>');
          layer.bindPopup(popupContent);
        }
      }
    });
  };

  // Implement toggLyrStd function from JavaScript version
  const toggLyrStd = async (layerId: string) => {
    const layer = layers.find(l => l.id === layerId);
    if (!layer || !map) return;

    const fn = layer.config.fn;
    const fnPath = layer.config.fnPath;
    const isChecked = layer.className;

    if (isChecked === 'unchecked') {
      if (leafletLayers[fn] === undefined) {
        await loadLayer(fnPath, fn, layer.config.style, layer.zIndex);
      } else {
        leafletLayers[fn].addTo(map);
      }
      // Update layer state
      setLayers(prev => prev.map(l => 
        l.id === layerId ? { ...l, visible: true, className: 'checked' } : l
      ));
    } else {
      if (leafletLayers[fn]) {
        leafletLayers[fn].remove();
      }
      // Update layer state
      setLayers(prev => prev.map(l => 
        l.id === layerId ? { ...l, visible: false, className: 'unchecked' } : l
      ));
    }
    updateLayerZIndex();
  };

  // Implement updateLayerZIndex function from JavaScript version
  const updateLayerZIndex = () => {
    layers.forEach((layer, index) => {
      if (leafletLayers[layer.config.fn] !== undefined && map) {
        const layerInstance = leafletLayers[layer.config.fn];
        if (layerInstance && 'setZIndex' in layerInstance && typeof layerInstance.setZIndex === 'function') {
          (layerInstance as any).setZIndex(1000 - index);
        }
      }
    });
  };

  if (!state.config?.mapLayers) return null;

  return (
    <>
      {/* Mini container - matches original mini_con0 */}
      <div
        id="mini_con0"
        className="mini_con"
        ref={miniConRef}
        style={{
          top: '10px',
          left: '50px',
          display: 'block',
          position: 'absolute',
          cursor: 'pointer',
          borderRadius: '5px',
          backgroundPosition: 'center',
          padding: '4px',
          backgroundRepeat: 'no-repeat',
          backgroundColor: '#162d2b', // Fallback background color
          width: '32px',
          height: '32px',
          verticalAlign: 'middle',
          zIndex: 40,
          boxShadow: '1px 1px 3px 0px #8e8e8e',
          // Add a simple icon text as fallback for missing image
          color: 'white',
          fontSize: '16px',
          fontWeight: 'bold',
          textAlign: 'center',
          lineHeight: '24px'
        }}
      >
        ≡
      </div>

      {/* Full container - matches original con0 */}
      <div
        id="con0"
        ref={conRef}
        style={{
          display: 'none',
          position: 'absolute',
          overflow: 'auto',
          top: 'calc(30%)',
          left: 'calc(10%)',
          minWidth: '276px',
          background: '#ffffff',
          zIndex: 30,
          border: '1px solid #777',
          boxShadow: '1px 1px 3px 0px #8e8e8e'
        }}
      >
        {/* Title bar */}
        <div
          id="title_con0"
          style={{
            color: 'white',
            backgroundColor: '#162d2b',
            lineHeight: '30px',
            textAlign: 'center',
            padding: 0,
            margin: 0,
            position: 'relative',
            fontWeight: 'bold',
            borderTopLeftRadius: '4px',
            borderTopRightRadius: '4px'
          }}
        >
          Map Layers
        </div>

        {/* Legend content */}
        <div className="legend">
          <ul>
            {layers.map((layer) => (
              <li
                key={layer.id}
                value={layer.id}
                className={layer.className}
                data-type="standard"
                onClick={() => toggLyrStd(layer.id)}
                style={{
                  backgroundColor: layer.visible ? 'rgb(175, 193, 126)' : 'rgba(45,78,69,0)',
                  cursor: 'pointer',
                  padding: '5px',
                  margin: '2px 0',
                  border: '1px solid #ddd',
                  borderRadius: '3px',
                  color: 'black'
                }}
              >
                <span style={{ marginRight: '8px' }}>
                  {layer.zIndex}
                </span>
                {layer.config.var_name}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}
