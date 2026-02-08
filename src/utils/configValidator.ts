// Configuration validation utilities for HydroVisE


export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  field: string;
  message: string;
  severity: 'error' | 'warning';
}

export interface ValidationWarning {
  field: string;
  message: string;
  suggestion?: string;
}

/**
 * Validates a complete HydroVisE configuration object
 */
export function validateConfig(config: any): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  // Check basic structure
  if (!config || typeof config !== 'object') {
    return {
      isValid: false,
      errors: [{ field: 'root', message: 'Configuration must be a valid object', severity: 'error' }],
      warnings: []
    };
  }

  // Validate required top-level fields
  validateRequiredFields(config, [
    'data_part',
    'map'
  ], errors);

  // Validate data_part
  if (config.data_part) {
    validateDataPart(config.data_part, errors, warnings);
  }

  // Validate map configuration
  if (config.map) {
    validateMapConfig(config.map, errors, warnings);
  }

  // Validate map markers if present
  if (config.mapMarkers) {
    validateMapMarkers(config.mapMarkers, errors, warnings);
  }

  // Validate spatial data if present
  if (config.spatialData) {
    validateSpatialData(config.spatialData, errors, warnings);
  }

  // Validate context layers if present
  if (config.contextLayers) {
    validateContextLayers(config.contextLayers, errors, warnings);
  }

  // Validate time slider if present
  if (config.timeSlider) {
    validateTimeSlider(config.timeSlider, errors, warnings);
  }

  return {
    isValid: errors.filter(e => e.severity === 'error').length === 0,
    errors,
    warnings
  };
}

function validateRequiredFields(obj: any, fields: string[], errors: ValidationError[]) {
  fields.forEach(field => {
    if (!(field in obj)) {
      errors.push({
        field,
        message: `Required field '${field}' is missing`,
        severity: 'error'
      });
    }
  });
}

function validateDataPart(dataPart: any, errors: ValidationError[], _warnings: ValidationWarning[]) {
  const requiredFields = ['initial', 'min_val', 'max_val'];
  validateRequiredFields(dataPart, requiredFields, errors);

  if (typeof dataPart.initial !== 'string' && typeof dataPart.initial !== 'number') {
    errors.push({
      field: 'data_part.initial',
      message: 'Initial value must be a string or number',
      severity: 'error'
    });
  }

  if (typeof dataPart.min_val !== 'number') {
    errors.push({
      field: 'data_part.min_val',
      message: 'Minimum value must be a number',
      severity: 'error'
    });
  }

  if (typeof dataPart.max_val !== 'number') {
    errors.push({
      field: 'data_part.max_val',
      message: 'Maximum value must be a number',
      severity: 'error'
    });
  }

  if (dataPart.min_val > dataPart.max_val) {
    errors.push({
      field: 'data_part',
      message: 'Minimum value must be less than or equal to maximum value',
      severity: 'error'
    });
  }
}

function validateMapConfig(mapConfig: any, errors: ValidationError[], warnings: ValidationWarning[]) {
  if (!mapConfig.center || !Array.isArray(mapConfig.center) || mapConfig.center.length !== 2) {
    errors.push({
      field: 'map.center',
      message: 'Map center must be an array of two numbers [lat, lng]',
      severity: 'error'
    });
  } else {
    const [lat, lng] = mapConfig.center;
    if (typeof lat !== 'number' || typeof lng !== 'number') {
      errors.push({
        field: 'map.center',
        message: 'Map center coordinates must be numbers',
        severity: 'error'
      });
    } else {
      if (lat < -90 || lat > 90) {
        errors.push({
          field: 'map.center',
          message: 'Latitude must be between -90 and 90',
          severity: 'error'
        });
      }
      if (lng < -180 || lng > 180) {
        errors.push({
          field: 'map.center',
          message: 'Longitude must be between -180 and 180',
          severity: 'error'
        });
      }
    }
  }

  if (typeof mapConfig.defaultZoom !== 'number' || mapConfig.defaultZoom < 1 || mapConfig.defaultZoom > 18) {
    warnings.push({
      field: 'map.defaultZoom',
      message: 'Map zoom should be a number between 1 and 18',
      suggestion: 'Use a zoom level between 1 (world view) and 18 (street level)'
    });
  }
}

function validateMapMarkers(mapMarkers: any, errors: ValidationError[], warnings: ValidationWarning[]) {
  const requiredFields = ['fnPath', 'comIDName'];
  validateRequiredFields(mapMarkers, requiredFields, errors);

  if (typeof mapMarkers.fnPath !== 'string') {
    errors.push({
      field: 'mapMarkers.fnPath',
      message: 'File path must be a string',
      severity: 'error'
    });
  } else if (!mapMarkers.fnPath.includes('{') || !mapMarkers.fnPath.includes('}')) {
    warnings.push({
      field: 'mapMarkers.fnPath',
      message: 'File path should contain template variables (e.g., {yr})',
      suggestion: 'Use template variables like {yr}, {prod} for dynamic file loading'
    });
  }

  if (typeof mapMarkers.comIDName !== 'string') {
    errors.push({
      field: 'mapMarkers.comIDName',
      message: 'ComID name must be a string',
      severity: 'error'
    });
  }

  // Validate marker attributes if present
  if (mapMarkers.markerAttr) {
    validateMarkerAttributes(mapMarkers.markerAttr, errors, warnings);
  }
}

function validateMarkerAttributes(markerAttr: any, errors: ValidationError[], _warnings: ValidationWarning[]) {
  Object.keys(markerAttr).forEach(key => {
    const attr = markerAttr[key];
    if (!attr.attribute || typeof attr.attribute !== 'string') {
      errors.push({
        field: `mapMarkers.markerAttr.${key}.attribute`,
        message: 'Attribute name must be a string',
        severity: 'error'
      });
    }

    if (attr.breaks && !Array.isArray(attr.breaks)) {
      errors.push({
        field: `mapMarkers.markerAttr.${key}.breaks`,
        message: 'Breaks must be an array',
        severity: 'error'
      });
    }

    if (attr.colors && !Array.isArray(attr.colors)) {
      errors.push({
        field: `mapMarkers.markerAttr.${key}.colors`,
        message: 'Colors must be an array',
        severity: 'error'
      });
    }
  });
}

function validateSpatialData(spatialData: any, errors: ValidationError[], warnings: ValidationWarning[]) {
  Object.keys(spatialData).forEach(key => {
    const spatial = spatialData[key];
    const fnPath = spatial.fnPath || spatial.geom?.fnPath;
    const hasPathTemplate = !!spatial.pathTemplate;

    if (!fnPath && !hasPathTemplate) {
      errors.push({
        field: `spatialData.${key}.fnPath`,
        message: 'File path (fnPath/geom.fnPath) or pathTemplate must be provided',
        severity: 'error'
      });
    } else if (fnPath && typeof fnPath !== 'string') {
      errors.push({
        field: `spatialData.${key}.fnPath`,
        message: 'File path must be a string',
        severity: 'error'
      });
    }

    if (!spatial.dataFormat && !spatial.geom?.extension && !spatial.pathTemplate && typeof spatial.dataFormat !== 'string') {
      warnings.push({
        field: `spatialData.${key}.dataFormat`,
        message: 'Data format should be specified',
        suggestion: 'Specify format like "geojson", "kml", or "csv"'
      });
    }

    // Validate rendering options if present
    if (spatial.rendering) {
      validateRenderingOptions(spatial.rendering, `spatialData.${key}.rendering`, errors, warnings);
    }
  });
}

function validateContextLayers(contextLayers: any, errors: ValidationError[], _warnings: ValidationWarning[]) {
  Object.keys(contextLayers).forEach(key => {
    const layer = contextLayers[key];

    if (!layer.type || typeof layer.type !== 'string') {
      errors.push({
        field: `contextLayers.${key}.type`,
        message: 'Layer type must be specified',
        severity: 'error'
      });
    }

    if (!layer.url || typeof layer.url !== 'string') {
      errors.push({
        field: `contextLayers.${key}.url`,
        message: 'Layer URL must be a string',
        severity: 'error'
      });
    }
  });
}

function validateTimeSlider(timeSlider: any, errors: ValidationError[], warnings: ValidationWarning[]) {
  if ((typeof timeSlider.min !== 'number' && typeof timeSlider.min !== 'string') ||
    (typeof timeSlider.max !== 'number' && typeof timeSlider.max !== 'string')) {
    errors.push({
      field: 'timeSlider',
      message: 'Time slider min and max must be numbers or template strings',
      severity: 'error'
    });
  }

  if (typeof timeSlider.min === 'number' && typeof timeSlider.max === 'number' && timeSlider.min >= timeSlider.max) {
    errors.push({
      field: 'timeSlider',
      message: 'Time slider minimum must be less than maximum',
      severity: 'error'
    });
  }

  if (timeSlider.step && typeof timeSlider.step !== 'number') {
    warnings.push({
      field: 'timeSlider.step',
      message: 'Time slider step should be a number',
      suggestion: 'Specify step size for slider increments'
    });
  }
}

function validateRenderingOptions(rendering: any, field: string, _errors: ValidationError[], warnings: ValidationWarning[]) {
  if (rendering.color && typeof rendering.color !== 'string') {
    warnings.push({
      field: `${field}.color`,
      message: 'Color should be a valid CSS color string',
      suggestion: 'Use hex (#FF0000), RGB (rgb(255,0,0)), or named colors'
    });
  }

  if (rendering.opacity && (typeof rendering.opacity !== 'number' || rendering.opacity < 0 || rendering.opacity > 1)) {
    warnings.push({
      field: `${field}.opacity`,
      message: 'Opacity should be a number between 0 and 1',
      suggestion: 'Use values like 0.5 for 50% transparency'
    });
  }

  if (rendering.weight && typeof rendering.weight !== 'number') {
    warnings.push({
      field: `${field}.weight`,
      message: 'Weight should be a number',
      suggestion: 'Use positive numbers for line thickness'
    });
  }
}

/**
 * Validates URL templates for dynamic content loading
 */
export function validateUrlTemplate(template: string, variables: string[]): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  // Check if template contains required variables
  variables.forEach(variable => {
    const placeholder = `{${variable}}`;
    if (!template.includes(placeholder)) {
      warnings.push({
        field: 'template',
        message: `Template should contain ${placeholder} for dynamic loading`,
        suggestion: `Add ${placeholder} to enable dynamic content based on ${variable}`
      });
    }
  });

  // Check for invalid placeholder syntax
  const placeholderRegex = /\{([^}]+)\}/g;
  const matches = template.match(placeholderRegex);
  if (matches) {
    matches.forEach(match => {
      const variable = match.slice(1, -1); // Remove { and }
      if (!variables.includes(variable)) {
        warnings.push({
          field: 'template',
          message: `Unknown placeholder variable: ${variable}`,
          suggestion: `Available variables: ${variables.join(', ')}`
        });
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Validates file paths and URLs
 */
export function validateFilePath(path: string): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  if (!path || typeof path !== 'string') {
    errors.push({
      field: 'path',
      message: 'Path must be a non-empty string',
      severity: 'error'
    });
    return { isValid: false, errors, warnings };
  }

  // Check for supported file extensions
  const supportedExtensions = ['.json', '.geojson', '.kml', '.csv', '.pbf'];
  const hasValidExtension = supportedExtensions.some(ext =>
    path.toLowerCase().includes(ext) || path.includes('{')
  );

  if (!hasValidExtension) {
    warnings.push({
      field: 'path',
      message: 'File extension not recognized',
      suggestion: `Supported formats: ${supportedExtensions.join(', ')}`
    });
  }

  // Check for URL vs local path
  if (path.startsWith('http://') || path.startsWith('https://')) {
    // Validate URL format
    try {
      new URL(path);
    } catch {
      errors.push({
        field: 'path',
        message: 'Invalid URL format',
        severity: 'error'
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Generates a human-readable validation report
 */
export function generateValidationReport(result: ValidationResult): string {
  const lines: string[] = [];

  if (result.isValid) {
    lines.push('✅ Configuration is valid!');
  } else {
    lines.push('❌ Configuration has errors that need to be fixed:');
  }

  lines.push('');

  if (result.errors.length > 0) {
    lines.push('🚨 ERRORS:');
    result.errors.forEach(error => {
      lines.push(`  - ${error.field}: ${error.message}`);
    });
    lines.push('');
  }

  if (result.warnings.length > 0) {
    lines.push('⚠️ WARNINGS:');
    result.warnings.forEach(warning => {
      lines.push(`  - ${warning.field}: ${warning.message}`);
      if (warning.suggestion) {
        lines.push(`    💡 Suggestion: ${warning.suggestion}`);
      }
    });
  }

  return lines.join('\n');
}
