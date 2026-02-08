import { HydroVisEConfig } from '../types/config';
// import { validateConfig, generateValidationReport } from './configValidator';

export async function loadConfig(configUrl: string): Promise<HydroVisEConfig> {
  try {
    console.log('Loading config from:', configUrl);
    const response = await fetch(configUrl);
    if (!response.ok) {
      throw new Error(`Failed to load config: ${response.status} ${response.statusText}`);
    }
    const config = await response.json();
    console.log('Config loaded successfully:', config);

    // Temporarily disable validation to debug
    /*
    // Validate configuration
    const validation = validateConfig(config);
    if (!validation.isValid) {
      const report = generateValidationReport(validation);
      console.error('Configuration validation failed:', report);
      throw new Error(`Invalid configuration:\n${report}`);
    }
    
    if (validation.warnings.length > 0) {
      const report = generateValidationReport(validation);
      console.warn('Configuration warnings:', report);
    }
    */

    console.log("HydroVisE React: Platform Initialized - Config:", configUrl);
    return config;
  } catch (error) {
    console.error('Error loading config:', error);
    throw error;
  }
}

export function getConfigUrl(): string {
  const urlParams = new URLSearchParams(window.location.search);
  const configParam = urlParams.get('config');
  const fileParam = urlParams.get('file');

  if (configParam) {
    if (fileParam) {
      // Support specific config files like ?config=ex2&file=config_issue_time
      return `./configs/${configParam}/${fileParam}.json`;
    } else {
      // Default config.json
      return `./configs/${configParam}/config.json`;
    }
  }

  return "./configs/case1/config.json";
}

export function checkXRange(_year: number | string): any {
  // This function needs to be implemented based on the original logic
  // For now, return null as placeholder
  return null;
}
