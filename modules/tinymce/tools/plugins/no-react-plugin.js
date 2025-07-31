/**
 * Rollup plugin that fails the build if React is imported
 */

const noReactPlugin = () => {
  return {
    name: 'no-react-plugin',
    resolveId(id, importer) {
      // Check for React imports
      if (id === 'react' || id.startsWith('react/') || id.startsWith('react-')) {
        this.error(`React imports are not allowed! Found import: "${id}" in ${importer || 'unknown file'}`);
      }
      
      return null; // Let other plugins handle resolution
    },
    
    transform(code, id) {
      // Additional check to catch dynamic imports or require statements
      const reactImportRegex = /(import\s+.*from\s+['"`]react['"`]|require\s*\(\s*['"`]react['"`]\s*\))/gi;
      const reactRelatedRegex = /(import\s+.*from\s+['"`]react-|require\s*\(\s*['"`]react-)/gi;
      
      if (reactImportRegex.test(code) || reactRelatedRegex.test(code)) {
        this.error(`React import detected in ${id}. React imports are not allowed in this build.`);
      }
      
      return null; // Don't transform the code
    }
  };
};

module.exports = noReactPlugin;