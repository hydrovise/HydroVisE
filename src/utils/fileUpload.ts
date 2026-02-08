// File upload utilities for various geospatial and data formats
import Papa from 'papaparse';

export interface FileUploadResult {
  success: boolean;
  data?: any;
  error?: string;
  type: 'geojson' | 'kml' | 'csv' | 'unknown';
  layerName?: string;
}

export interface UploadedLayer {
  id: string;
  name: string;
  type: string;
  data: any;
  visible: boolean;
  style?: {
    color?: string;
    weight?: number;
    opacity?: number;
    fillColor?: string;
    fillOpacity?: number;
  };
}

// Parse KML to GeoJSON
export function parseKMLToGeoJSON(kmlText: string): any {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(kmlText, 'text/xml');

    // Simple KML parser - extracts Placemarks
    const placemarks = doc.getElementsByTagName('Placemark');
    const features: any[] = [];

    for (let i = 0; i < placemarks.length; i++) {
      const placemark = placemarks[i];
      const name = placemark.getElementsByTagName('name')[0]?.textContent || `Feature ${i + 1}`;
      const description = placemark.getElementsByTagName('description')[0]?.textContent || '';

      // Extract coordinates from Point, LineString, or Polygon
      const coordinates = extractKMLCoordinates(placemark);

      if (coordinates) {
        features.push({
          type: 'Feature',
          properties: {
            name,
            description
          },
          geometry: coordinates
        });
      }
    }

    return {
      type: 'FeatureCollection',
      features
    };
  } catch (error) {
    throw new Error(`Failed to parse KML: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

function extractKMLCoordinates(placemark: Element): any {
  // Try Point
  const point = placemark.getElementsByTagName('Point')[0];
  if (point) {
    const coords = point.getElementsByTagName('coordinates')[0]?.textContent?.trim();
    if (coords) {
      const [lng, lat, alt] = coords.split(',').map(Number);
      return {
        type: 'Point',
        coordinates: alt !== undefined ? [lng, lat, alt] : [lng, lat]
      };
    }
  }

  // Try LineString
  const lineString = placemark.getElementsByTagName('LineString')[0];
  if (lineString) {
    const coords = lineString.getElementsByTagName('coordinates')[0]?.textContent?.trim();
    if (coords) {
      const coordinates = coords.split(/\s+/).map(coord => {
        const [lng, lat, alt] = coord.split(',').map(Number);
        return alt !== undefined ? [lng, lat, alt] : [lng, lat];
      });
      return {
        type: 'LineString',
        coordinates
      };
    }
  }

  // Try Polygon
  const polygon = placemark.getElementsByTagName('Polygon')[0];
  if (polygon) {
    const outerBoundary = polygon.getElementsByTagName('outerBoundaryIs')[0];
    if (outerBoundary) {
      const linearRing = outerBoundary.getElementsByTagName('LinearRing')[0];
      if (linearRing) {
        const coords = linearRing.getElementsByTagName('coordinates')[0]?.textContent?.trim();
        if (coords) {
          const coordinates = coords.split(/\s+/).map(coord => {
            const [lng, lat, alt] = coord.split(',').map(Number);
            return alt !== undefined ? [lng, lat, alt] : [lng, lat];
          });
          return {
            type: 'Polygon',
            coordinates: [coordinates]
          };
        }
      }
    }
  }

  return null;
}

// Parse CSV data for time series or spatial data
export function parseCSVData(csvText: string): Promise<any[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          reject(new Error(`CSV parsing errors: ${results.errors.map(e => e.message).join(', ')}`));
        } else {
          resolve(results.data);
        }
      },
      error: (error: any) => {
        reject(new Error(`Failed to parse CSV: ${error.message}`));
      }
    });
  });
}

// Detect file type based on content
export function detectFileType(content: string, filename: string): 'geojson' | 'kml' | 'csv' | 'unknown' {
  const lowerFilename = filename.toLowerCase();

  if (lowerFilename.endsWith('.geojson') || lowerFilename.endsWith('.json')) {
    try {
      const parsed = JSON.parse(content);
      if (parsed.type === 'FeatureCollection' || parsed.type === 'Feature') {
        return 'geojson';
      }
    } catch {
      // Not valid JSON
    }
  }

  if (lowerFilename.endsWith('.kml') || content.includes('<kml') || content.includes('<?xml')) {
    return 'kml';
  }

  if (lowerFilename.endsWith('.csv') || content.includes(',')) {
    return 'csv';
  }

  // Try to detect by content
  const trimmed = content.trim();
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    try {
      const parsed = JSON.parse(content);
      if (parsed.type === 'FeatureCollection' || parsed.type === 'Feature') {
        return 'geojson';
      }
    } catch {
      // Not valid JSON
    }
  }

  if (trimmed.includes('<kml') || trimmed.includes('<?xml')) {
    return 'kml';
  }

  return 'unknown';
}

// Process uploaded file
export async function processUploadedFile(file: File): Promise<FileUploadResult> {
  try {
    const content = await readFileAsText(file);
    const fileType = detectFileType(content, file.name);

    switch (fileType) {
      case 'geojson':
        try {
          const data = JSON.parse(content);
          return {
            success: true,
            data,
            type: 'geojson',
            layerName: file.name.replace(/\.[^/.]+$/, '')
          };
        } catch (error) {
          return {
            success: false,
            error: `Invalid GeoJSON format: ${error instanceof Error ? error.message : 'Unknown error'}`,
            type: 'geojson'
          };
        }

      case 'kml':
        try {
          const data = parseKMLToGeoJSON(content);
          return {
            success: true,
            data,
            type: 'kml',
            layerName: file.name.replace(/\.[^/.]+$/, '')
          };
        } catch (error) {
          return {
            success: false,
            error: `Invalid KML format: ${error instanceof Error ? error.message : 'Unknown error'}`,
            type: 'kml'
          };
        }

      case 'csv':
        try {
          const data = await parseCSVData(content);
          return {
            success: true,
            data,
            type: 'csv',
            layerName: file.name.replace(/\.[^/.]+$/, '')
          };
        } catch (error) {
          return {
            success: false,
            error: `Invalid CSV format: ${error instanceof Error ? error.message : 'Unknown error'}`,
            type: 'csv'
          };
        }

      default:
        return {
          success: false,
          error: 'Unsupported file format. Please upload GeoJSON, KML, or CSV files.',
          type: 'unknown'
        };
    }
  } catch (error) {
    return {
      success: false,
      error: `Failed to read file: ${error instanceof Error ? error.message : 'Unknown error'}`,
      type: 'unknown'
    };
  }
}

// Read file as text
function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        resolve(e.target.result as string);
      } else {
        reject(new Error('Failed to read file'));
      }
    };
    reader.onerror = () => reject(new Error('File reading error'));
    reader.readAsText(file);
  });
}

// Generate random color for new layers
export function generateLayerColor(): string {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57',
    '#FF9FF3', '#54A0FF', '#5F27CD', '#00D2D3', '#FF9F43',
    '#C44569', '#F8B500', '#6C5CE7', '#A29BFE', '#FD79A8'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

// Validate GeoJSON structure
export function validateGeoJSON(data: any): boolean {
  if (!data || typeof data !== 'object') return false;

  if (data.type === 'FeatureCollection') {
    return Array.isArray(data.features) &&
      data.features.every((feature: any) => validateGeoJSONFeature(feature));
  }

  if (data.type === 'Feature') {
    return validateGeoJSONFeature(data);
  }

  return false;
}

function validateGeoJSONFeature(feature: any): boolean {
  return feature &&
    typeof feature === 'object' &&
    feature.type === 'Feature' &&
    feature.geometry &&
    typeof feature.geometry === 'object' &&
    feature.geometry.type &&
    Array.isArray(feature.geometry.coordinates);
}

// Extract bounds from GeoJSON
export function extractGeoJSONBounds(data: any): [[number, number], [number, number]] | null {
  if (!validateGeoJSON(data)) return null;

  const features = data.type === 'FeatureCollection' ? data.features : [data];
  let minLng = Infinity, minLat = Infinity, maxLng = -Infinity, maxLat = -Infinity;

  features.forEach((feature: any) => {
    const coords = extractAllCoordinates(feature.geometry);
    coords.forEach(([lng, lat]: [number, number]) => {
      minLng = Math.min(minLng, lng);
      minLat = Math.min(minLat, lat);
      maxLng = Math.max(maxLng, lng);
      maxLat = Math.max(maxLat, lat);
    });
  });

  if (minLng === Infinity) return null;
  return [[minLat, minLng], [maxLat, maxLng]];
}

function extractAllCoordinates(geometry: any): [number, number][] {
  const coords: [number, number][] = [];

  switch (geometry.type) {
    case 'Point':
      coords.push([geometry.coordinates[0], geometry.coordinates[1]]);
      break;
    case 'LineString':
      geometry.coordinates.forEach((coord: number[]) => {
        coords.push([coord[0], coord[1]]);
      });
      break;
    case 'Polygon':
      geometry.coordinates[0].forEach((coord: number[]) => {
        coords.push([coord[0], coord[1]]);
      });
      break;
    case 'MultiPoint':
      geometry.coordinates.forEach((coord: number[]) => {
        coords.push([coord[0], coord[1]]);
      });
      break;
    case 'MultiLineString':
      geometry.coordinates.forEach((line: number[][]) => {
        line.forEach((coord: number[]) => {
          coords.push([coord[0], coord[1]]);
        });
      });
      break;
    case 'MultiPolygon':
      geometry.coordinates.forEach((polygon: number[][][]) => {
        polygon[0].forEach((coord: number[]) => {
          coords.push([coord[0], coord[1]]);
        });
      });
      break;
  }

  return coords;
}
