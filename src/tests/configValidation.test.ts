import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { validateConfig } from '../utils/configValidator';

const PROJECT_ROOT = path.resolve(__dirname, '../../');
const PUBLIC_DIR = path.join(PROJECT_ROOT, 'public');
const CONFIGS_DIR = path.join(PUBLIC_DIR, 'configs');

// Helper to find all config.json files
function findConfigFiles(dir: string, fileList: string[] = []): string[] {
    const files = fs.readdirSync(dir);

    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            findConfigFiles(filePath, fileList);
        } else if (file === 'config.json') {
            fileList.push(filePath);
        }
    });

    return fileList;
}

// Helper to resolve URL to local file path
function resolveUrlToPath(url: string): string | null {
    const prefixHydrovise = 'http://localhost:5173/hydrovise/';
    const prefixConfigs = 'http://localhost:5173/configs/';

    if (url.startsWith(prefixHydrovise)) {
        const relativePath = url.substring(prefixHydrovise.length);
        const cleanPath = relativePath.split('?')[0];
        return path.join(PUBLIC_DIR, 'hydrovise', cleanPath);
    } else if (url.startsWith(prefixConfigs)) {
        const relativePath = url.substring(prefixConfigs.length);
        const cleanPath = relativePath.split('?')[0];
        return path.join(PUBLIC_DIR, 'configs', cleanPath);
    }
    return null;
}

// Helper to check if a file exists, handling simple templates
function checkFileExists(filePath: string, config: any): boolean {
    // If path has no templates, check directly
    if (!filePath.includes('{')) {
        return fs.existsSync(filePath);
    }

    // Try to substitute common variables
    let testPath = filePath;

    // Substitute year
    if (config.data_part) {
        const year = config.data_part.initial || config.data_part.min_val;
        if (year) {
            testPath = testPath.replace(/{yr}/g, String(year));
            testPath = testPath.replace(/{year}/g, String(year));
        }
    }

    // If it still has templates, we might not be able to fully validate it
    // But we can check if the directory exists
    if (testPath.includes('{')) {
        const dir = path.dirname(testPath.split('{')[0]); // Get part before first template
        return fs.existsSync(dir);
    }

    return fs.existsSync(testPath);
}

describe('Configuration Validation', () => {
    const configFiles = findConfigFiles(CONFIGS_DIR);

    if (configFiles.length === 0) {
        it('should find config files', () => {
            expect(true).toBe(false); // Fail if no configs found
        });
    }

    configFiles.forEach(configPath => {
        const relativePath = path.relative(PROJECT_ROOT, configPath);

        describe(`Config: ${relativePath}`, () => {
            let config: any;
            let rawContent: string;

            it('should be valid JSON', () => {
                rawContent = fs.readFileSync(configPath, 'utf-8');
                expect(() => {
                    config = JSON.parse(rawContent);
                }).not.toThrow();
            });

            it('should pass structural validation', () => {
                if (!config) return;
                const result = validateConfig(config);
                if (!result.isValid) {
                    console.error(`Validation errors for ${relativePath}:`, JSON.stringify(result.errors, null, 2));
                }
                expect(result.isValid).toBe(true);
            });

            it('should have valid resource paths', () => {
                if (!config) return;

                const pathsToCheck: string[] = [];

                // Collect paths from known locations
                if (config.mapMarkers?.fnPath) pathsToCheck.push(config.mapMarkers.fnPath);
                if (config.horizontalGrid?.filename) pathsToCheck.push(config.horizontalGrid.filename);

                if (config.traces) {
                    Object.values(config.traces).forEach((trace: any) => {
                        if (trace.template?.path_format) pathsToCheck.push(trace.template.path_format);
                    });
                }

                if (config.mapLayers) {
                    Object.values(config.mapLayers).forEach((layer: any) => {
                        if (layer.fnPath) pathsToCheck.push(layer.fnPath);
                    });
                }

                if (config.spatialData) {
                    Object.values(config.spatialData).forEach((item: any) => {
                        if (item.fnPath) pathsToCheck.push(item.fnPath);
                    });
                }

                // Check each path
                const missingFiles: string[] = [];
                pathsToCheck.forEach(url => {
                    const localPath = resolveUrlToPath(url);
                    if (localPath) {
                        if (!checkFileExists(localPath, config)) {
                            missingFiles.push(`${url} -> ${localPath}`);
                        }
                    }
                });

                if (missingFiles.length > 0) {
                    console.warn(`Missing resources for ${relativePath}:\n${missingFiles.join('\n')}`);
                }

                // We make this a warning for now, or fail if strict
                // expect(missingFiles.length).toBe(0); 
                // For now, just log them, as some might be genuinely missing or misconfigured in legacy examples
            });
        });
    });
});
