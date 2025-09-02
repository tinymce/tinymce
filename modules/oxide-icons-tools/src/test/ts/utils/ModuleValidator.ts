import { writeFileSync, unlinkSync } from 'fs';
import { join } from 'path';

interface ModuleExports {
  getAll?: () => Record<string, string>;
}

/**
 * Validates a module string by writing it to a temporary file and importing it
 * @param content The module content to validate
 * @returns The module exports
 */
export const validateModule = async (content: string): Promise<ModuleExports> => {
  const tempFile = join(process.cwd(), 'temp-module.mjs');
  try {
    // Write content to a temporary file
    writeFileSync(tempFile, content);
    // Import the module using dynamic import
    const module = await import(tempFile);
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
