import { writeFileSync, unlinkSync } from 'fs';
import { join } from 'path';

interface IconModule {
  getAll: () => Record<string, string>;
}

/**
 * Loads an ES module from a file path
 * @param filePath The path to the module file
 * @returns The module exports
 */
export const loadModule = async (filePath: string): Promise<IconModule> => {
  // Import the module using dynamic import
  const module = require(filePath);
  return module;
};

/**
 * Loads a module from a string of code
 * @param code The module code to load
 * @returns The module exports
 */
export const loadModuleFromString = async (code: string): Promise<IconModule> => {
  const tempFile = join(process.cwd(), 'temp-module.mjs');
  try {
    // Write content to a temporary file
    writeFileSync(tempFile, code);
    // Import the module using dynamic import
    const module = require(tempFile);
    return module;
  } finally {
    // Clean up temporary file
    try {
      unlinkSync(tempFile);
    } catch (_e) {
      // Ignore cleanup errors
    }
  }
};
