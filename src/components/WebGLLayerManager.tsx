import React, { useEffect, useRef, useContext } from 'react';
import L from 'leaflet';
import { AppContext } from '../context/AppContext';

// Note: This is a placeholder for WebGL functionality
// In the original code, this used L.glify which is a WebGL extension for Leaflet
// We'll implement a basic structure that can be extended with actual WebGL libraries

interface WebGLLayerProps {
  dataKey: string;
  data: any[];
  geometryType: 'Point' | 'Line' | 'Polygon';
  style: {
    color: string | ((feature: any) => string);
    opacity: number;
    weight?: number | ((feature: any) => number);
  };
  onFeatureClick?: (event: any, feature: any) => void;
  map: L.Map;
}

interface WebGLPoint {
  lat: number;
  lng: number;
  properties?: any;
}

interface WebGLLine {
  coordinates: [number, number][];
  properties?: any;
}

interface WebGLPolygon {
  coordinates: [number, number][][];
  properties?: any;
}

export class WebGLRenderer {
  private map: L.Map;
  private layers: Map<string, any> = new Map();
  private canvas: HTMLCanvasElement | null = null;
  private gl: WebGLRenderingContext | null = null;

  constructor(map: L.Map) {
    this.map = map;
    this.initializeWebGL();
  }

  private initializeWebGL() {
    // Create canvas overlay
    this.canvas = document.createElement('canvas');
    this.canvas.style.position = 'absolute';
    this.canvas.style.top = '0';
    this.canvas.style.left = '0';
    this.canvas.style.pointerEvents = 'none';
    this.canvas.style.zIndex = '1000';

    // Get WebGL context
    this.gl = (this.canvas.getContext('webgl') || this.canvas.getContext('experimental-webgl')) as WebGLRenderingContext;

    if (!this.gl) {
      console.warn('WebGL not supported, falling back to SVG rendering');
      return;
    }

    // Add canvas to map container
    const mapContainer = this.map.getContainer();
    mapContainer.appendChild(this.canvas);

    // Update canvas size when map resizes
    this.map.on('resize', this.updateCanvasSize.bind(this));
    this.map.on('move', this.render.bind(this));
    this.map.on('zoom', this.render.bind(this));

    this.updateCanvasSize();
  }

  private updateCanvasSize() {
    if (!this.canvas) return;

    const size = this.map.getSize();
    this.canvas.width = size.x;
    this.canvas.height = size.y;
    this.canvas.style.width = size.x + 'px';
    this.canvas.style.height = size.y + 'px';

    if (this.gl) {
      this.gl.viewport(0, 0, size.x, size.y);
    }
  }

  addPointLayer(key: string, data: WebGLPoint[], style: any, onClick?: Function): any {
    if (!this.gl) {
      // Fallback to Leaflet markers
      return this.addPointLayerFallback(key, data, style, onClick);
    }

    // WebGL point rendering implementation would go here
    const layer = {
      type: 'points',
      data,
      style,
      onClick
    };

    this.layers.set(key, layer);
    this.render();
    return layer;
  }

  addLineLayer(key: string, data: WebGLLine[], style: any, onClick?: Function): any {
    if (!this.gl) {
      // Fallback to Leaflet polylines
      return this.addLineLayerFallback(key, data, style, onClick);
    }

    // WebGL line rendering implementation would go here
    const layer = {
      type: 'lines',
      data,
      style,
      onClick
    };

    this.layers.set(key, layer);
    this.render();
    return layer;
  }

  addPolygonLayer(key: string, data: WebGLPolygon[], style: any, onClick?: Function): any {
    if (!this.gl) {
      // Fallback to Leaflet polygons
      return this.addPolygonLayerFallback(key, data, style, onClick);
    }

    // WebGL polygon rendering implementation would go here
    const layer = {
      type: 'polygons',
      data,
      style,
      onClick
    };

    this.layers.set(key, layer);
    this.render();
    return layer;
  }

  private addPointLayerFallback(key: string, data: WebGLPoint[], style: any, onClick?: Function): L.LayerGroup {
    const layerGroup = L.layerGroup();

    data.forEach(point => {
      const color = typeof style.color === 'function' ? style.color(point) : style.color;
      const marker = L.circleMarker([point.lat, point.lng], {
        color: color,
        fillColor: color,
        fillOpacity: style.opacity,
        radius: 5,
        weight: 2
      });

      if (onClick) {
        marker.on('click', (e) => onClick(e, point));
      }

      layerGroup.addLayer(marker);
    });

    layerGroup.addTo(this.map);
    this.layers.set(key, layerGroup);
    return layerGroup;
  }

  private addLineLayerFallback(key: string, data: WebGLLine[], style: any, onClick?: Function): L.LayerGroup {
    const layerGroup = L.layerGroup();

    data.forEach(line => {
      const color = typeof style.color === 'function' ? style.color(line) : style.color;
      const weight = typeof style.weight === 'function' ? style.weight(line) : style.weight || 2;

      const polyline = L.polyline(
        line.coordinates.map(coord => [coord[1], coord[0]]) as L.LatLngExpression[],
        {
          color: color,
          opacity: style.opacity,
          weight: weight
        }
      );

      if (onClick) {
        polyline.on('click', (e) => onClick(e, line));
      }

      layerGroup.addLayer(polyline);
    });

    layerGroup.addTo(this.map);
    this.layers.set(key, layerGroup);
    return layerGroup;
  }

  private addPolygonLayerFallback(key: string, data: WebGLPolygon[], style: any, onClick?: Function): L.LayerGroup {
    const layerGroup = L.layerGroup();

    data.forEach(polygon => {
      const color = typeof style.color === 'function' ? style.color(polygon) : style.color;

      const leafletPolygon = L.polygon(
        polygon.coordinates.map(ring =>
          ring.map(coord => [coord[1], coord[0]]) as L.LatLngExpression[]
        ),
        {
          color: color,
          fillColor: color,
          fillOpacity: style.opacity,
          weight: 2
        }
      );

      if (onClick) {
        leafletPolygon.on('click', (e) => onClick(e, polygon));
      }

      layerGroup.addLayer(leafletPolygon);
    });

    layerGroup.addTo(this.map);
    this.layers.set(key, layerGroup);
    return layerGroup;
  }

  removeLayer(key: string) {
    const layer = this.layers.get(key);
    if (layer) {
      if (layer.removeFrom) {
        layer.removeFrom(this.map);
      } else if (layer.remove) {
        layer.remove();
      }
      this.layers.delete(key);
      this.render();
    }
  }

  private render() {
    if (!this.gl || !this.canvas) return;

    // Clear canvas
    this.gl.clearColor(0, 0, 0, 0);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);

    // Render each layer
    this.layers.forEach((layer, _key) => {
      if (layer.type === 'points') {
        this.renderPoints(layer);
      } else if (layer.type === 'lines') {
        this.renderLines(layer);
      } else if (layer.type === 'polygons') {
        this.renderPolygons(layer);
      }
    });
  }

  private renderPoints(layer: any) {
    // WebGL point rendering implementation
    // This would involve creating vertex buffers, shaders, etc.
    console.log('Rendering WebGL points:', layer.data.length);
  }

  private renderLines(layer: any) {
    // WebGL line rendering implementation
    console.log('Rendering WebGL lines:', layer.data.length);
  }

  private renderPolygons(layer: any) {
    // WebGL polygon rendering implementation
    console.log('Rendering WebGL polygons:', layer.data.length);
  }

  destroy() {
    if (this.canvas && this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
    }
    this.layers.clear();
  }
}

// React component for WebGL layer management
export const WebGLLayerManager: React.FC<WebGLLayerProps> = ({
  dataKey,
  data,
  geometryType,
  style,
  onFeatureClick,
  map
}) => {
  const rendererRef = useRef<WebGLRenderer | null>(null);
  const { state: _state } = useContext(AppContext)!;

  useEffect(() => {
    if (!map) return;

    // Initialize WebGL renderer
    if (!rendererRef.current) {
      rendererRef.current = new WebGLRenderer(map);
    }

    const renderer = rendererRef.current;

    // Add layer based on geometry type
    switch (geometryType) {
      case 'Point':
        renderer.addPointLayer(dataKey, data as WebGLPoint[], style, onFeatureClick);
        break;
      case 'Line':
        renderer.addLineLayer(dataKey, data as WebGLLine[], style, onFeatureClick);
        break;
      case 'Polygon':
        renderer.addPolygonLayer(dataKey, data as WebGLPolygon[], style, onFeatureClick);
        break;
    }

    return () => {
      if (renderer) {
        renderer.removeLayer(dataKey);
      }
    };
  }, [map, dataKey, data, geometryType, style, onFeatureClick]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (rendererRef.current) {
        rendererRef.current.destroy();
      }
    };
  }, []);

  return null; // This component doesn't render anything directly
};

// Hook for using WebGL renderer
export const useWebGLRenderer = (map: L.Map | null) => {
  const rendererRef = useRef<WebGLRenderer | null>(null);

  useEffect(() => {
    if (map && !rendererRef.current) {
      rendererRef.current = new WebGLRenderer(map);
    }

    return () => {
      if (rendererRef.current) {
        rendererRef.current.destroy();
        rendererRef.current = null;
      }
    };
  }, [map]);

  return rendererRef.current;
};

export default WebGLLayerManager;
