import React, { useState, useRef, useCallback, DragEvent, useEffect } from 'react';
import L from 'leaflet';
import JSZip from 'jszip';
import { kml } from '@tmcw/togeojson';

interface Layer {
  id: string;
  name: string;
  type: 'base' | 'markers' | 'spatial' | 'uploaded';
  visible: boolean;
  file?: File;
  data?: any;
  layer?: L.Layer;
}

interface InventoryPanelProps {
  isVisible: boolean;
  onToggle: () => void;
  map?: L.Map | null;
  onLayerChange?: (layers: Layer[]) => void;
}

export default function InventoryPanel({ isVisible, onToggle, map, onLayerChange }: InventoryPanelProps) {
  const [layers, setLayers] = useState<Layer[]>([
    { id: 'base', name: 'Base Map', type: 'base', visible: true },
    { id: 'markers', name: 'Map Markers', type: 'markers', visible: true },
    { id: 'spatial', name: 'Spatial Data', type: 'spatial', visible: false }
  ]);
  
  const [isDragOver, setIsDragOver] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Notify parent of layer changes
  useEffect(() => {
    if (onLayerChange) {
      onLayerChange(layers);
    }
  }, [layers, onLayerChange]);

  const handleLayerToggle = useCallback((layerId: string) => {
    setLayers(prevLayers => {
      const updatedLayers = prevLayers.map(layer => {
        if (layer.id === layerId) {
          const updatedLayer = { ...layer, visible: !layer.visible };
          
          // Handle map layer visibility if map and layer exist
          if (map && layer.layer) {
            if (updatedLayer.visible) {
              map.addLayer(layer.layer);
            } else {
              map.removeLayer(layer.layer);
            }
          }
          
          return updatedLayer;
        }
        return layer;
      });
      
      return updatedLayers;
    });
    console.log(`Toggled layer: ${layerId}`);
  }, [map]);

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    files.forEach(file => processFile(file));
  }, []);

  const processFile = useCallback(async (file: File) => {
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    
    if (!['geojson', 'kml', 'kmz', 'json'].includes(fileExtension || '')) {
      alert('Unsupported file format. Please upload GeoJSON, KML, or KMZ files.');
      return;
    }

    try {
      let geoJsonData: any = null;
      let leafletLayer: L.Layer | null = null;

      if (fileExtension === 'geojson' || fileExtension === 'json') {
        const text = await file.text();
        geoJsonData = JSON.parse(text);
        leafletLayer = createGeoJSONLayer(geoJsonData);
      } else if (fileExtension === 'kml') {
        const text = await file.text();
        const parser = new DOMParser();
        const kmlDom = parser.parseFromString(text, 'text/xml');
        geoJsonData = kml(kmlDom);
        leafletLayer = createGeoJSONLayer(geoJsonData);
      } else if (fileExtension === 'kmz') {
        const arrayBuffer = await file.arrayBuffer();
        const zip = await JSZip.loadAsync(arrayBuffer);
        const kmlFiles = Object.keys(zip.files).filter(filename => 
          filename.toLowerCase().endsWith('.kml')
        );
        
        if (kmlFiles.length === 0) {
          alert('No KML files found in KMZ archive');
          return;
        }
        
        const kmlFile = zip.files[kmlFiles[0]];
        const kmlText = await kmlFile.async('text');
        const parser = new DOMParser();
        const kmlDom = parser.parseFromString(kmlText, 'text/xml');
        geoJsonData = kml(kmlDom);
        leafletLayer = createGeoJSONLayer(geoJsonData);
      }

      if (leafletLayer && geoJsonData) {
        const newLayer: Layer = {
          id: `uploaded-${Date.now()}`,
          name: file.name,
          type: 'uploaded',
          visible: true,
          file,
          data: geoJsonData,
          layer: leafletLayer
        };

        setLayers(prevLayers => [...prevLayers, newLayer]);

        // Add to map if map is available
        if (map && leafletLayer) {
          map.addLayer(leafletLayer);
        }

        console.log(`Successfully loaded ${file.name}`);
      }
    } catch (error) {
      console.error('Error processing file:', error);
      alert(`Error loading ${file.name}: ${error}`);
    }
  }, [map]);

  const createGeoJSONLayer = useCallback((geoJsonData: any): L.Layer => {
    return L.geoJSON(geoJsonData, {
      style: {
        fillOpacity: 0.6,
        color: '#3388ff',
        weight: 2,
        fillColor: '#3388ff'
      },
      onEachFeature: (feature, layer) => {
        if (feature.properties) {
          const popupContent = Object.entries(feature.properties)
            .map(([key, value]) => `<strong>${key}:</strong> ${value}`)
            .join('<br>');
          layer.bindPopup(popupContent);
        }
      }
    });
  }, []);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach(file => processFile(file));
    }
  }, [processFile]);

  const handleDeleteLayer = useCallback((layerId: string) => {
    setLayers(prevLayers => {
      const layerToDelete = prevLayers.find(layer => layer.id === layerId);
      
      // Remove from map if it exists
      if (map && layerToDelete?.layer) {
        map.removeLayer(layerToDelete.layer);
      }
      
      return prevLayers.filter(layer => layer.id !== layerId);
    });
  }, [map]);

  const moveLayer = useCallback((fromIndex: number, toIndex: number) => {
    setLayers(prevLayers => {
      const newLayers = [...prevLayers];
      const [movedLayer] = newLayers.splice(fromIndex, 1);
      newLayers.splice(toIndex, 0, movedLayer);
      return newLayers;
    });
  }, []);

  const handleDragStart = useCallback((e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleDragOverLayer = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const handleDropOnLayer = useCallback((e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== dropIndex) {
      moveLayer(draggedIndex, dropIndex);
    }
    setDraggedIndex(null);
  }, [draggedIndex, moveLayer]);

  const getLayerIcon = (type: string) => {
    switch (type) {
      case 'base': return '🗺️';
      case 'markers': return '📍';
      case 'spatial': return '🌍';
      case 'uploaded': return '📄';
      default: return '📁';
    }
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div style={{
      position: 'absolute',
      top: '20px',
      left: '20px',
      width: '300px',
      backgroundColor: 'white',
      border: '1px solid #ccc',
      borderRadius: '8px',
      padding: '15px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      zIndex: 1000,
      fontFamily: 'Arial, sans-serif'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '15px',
        borderBottom: '1px solid #eee',
        paddingBottom: '10px'
      }}>
        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>
          Map Inventory
        </h3>
        <button
          onClick={onToggle}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '18px',
            cursor: 'pointer',
            padding: '0',
            color: '#666'
          }}
        >
          ×
        </button>
      </div>

      {/* File Upload Area */}
      <div
        style={{
          border: `2px dashed ${isDragOver ? '#4CAF50' : '#ccc'}`,
          borderRadius: '4px',
          padding: '20px',
          textAlign: 'center',
          marginBottom: '15px',
          backgroundColor: isDragOver ? '#f9f9f9' : 'transparent',
          cursor: 'pointer',
          transition: 'all 0.3s ease'
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <div style={{ fontSize: '24px', marginBottom: '8px' }}>📁</div>
        <div style={{ fontSize: '14px', color: '#666' }}>
          Drop spatial files here or click to browse
        </div>
        <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>
          Supports GeoJSON, KML, KMZ
        </div>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".geojson,.json,.kml,.kmz"
          onChange={handleFileInputChange}
          style={{ display: 'none' }}
        />
      </div>

      {/* Layer List */}
      <div style={{ marginBottom: '10px' }}>
        <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#666' }}>
          Layers ({layers.length})
        </h4>
        
        {layers.map((layer, index) => (
          <div
            key={layer.id}
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={handleDragOverLayer}
            onDrop={(e) => handleDropOnLayer(e, index)}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '8px',
              border: '1px solid #eee',
              borderRadius: '4px',
              marginBottom: '4px',
              backgroundColor: draggedIndex === index ? '#f0f0f0' : 'white',
              cursor: 'move',
              opacity: draggedIndex === index ? 0.5 : 1
            }}
          >
            <div style={{ fontSize: '16px', marginRight: '8px' }}>
              {getLayerIcon(layer.type)}
            </div>
            
            <div style={{ 
              flex: 1,
              fontSize: '13px',
              fontWeight: layer.visible ? '500' : 'normal',
              color: layer.visible ? '#333' : '#999'
            }}>
              {layer.name}
            </div>
            
            <button
              onClick={() => handleLayerToggle(layer.id)}
              style={{
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                border: 'none',
                backgroundColor: layer.visible ? '#4CAF50' : '#ccc',
                cursor: 'pointer',
                marginRight: '8px',
                transition: 'background-color 0.3s ease'
              }}
              title={layer.visible ? 'Hide layer' : 'Show layer'}
            />
            
            {layer.type === 'uploaded' && (
              <button
                onClick={() => handleDeleteLayer(layer.id)}
                style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '3px',
                  border: 'none',
                  backgroundColor: '#ff4444',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                title="Delete layer"
              >
                ×
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
