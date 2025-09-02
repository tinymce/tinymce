import * as ts from 'typescript';

interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Validates that a module has the expected exports and types using TypeScript's AST
 * @param sourceCode The source code to validate
 * @returns Validation result with any errors found
 */
export const validateModuleStructure = (sourceCode: string): ValidationResult => {
  const sourceFile = ts.createSourceFile(
    'module.ts',
    sourceCode,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS
  );

  const errors: string[] = [];

  // Check for export declarations
  let hasGetAllExport = false;

  const visitNode = (node: ts.Node) => {
    // Check for export declarations
    if (ts.isExportDeclaration(node)) {
      // Handle named exports like: export { getAll }
      if (node.exportClause && ts.isNamedExports(node.exportClause)) {
        node.exportClause.elements.forEach(element => {
          if (element.name.text === 'getAll') {
            hasGetAllExport = true;
          }
        });
      }
    }
    // Check for direct exports like: export const getAll = ...
    else if (ts.isVariableStatement(node) && node.modifiers?.some(m => m.kind === ts.SyntaxKind.ExportKeyword)) {
      node.declarationList.declarations.forEach(declaration => {
        if (ts.isIdentifier(declaration.name) && declaration.name.text === 'getAll') {
          hasGetAllExport = true;
          
          // Check that getAll is a function that returns a Record<string, string>
          if (declaration.initializer) {
            if (ts.isArrowFunction(declaration.initializer) || ts.isFunctionExpression(declaration.initializer)) {
              // Verify return type if explicitly specified
              const returnType = declaration.initializer.type;
              if (returnType) {
                if (ts.isTypeReferenceNode(returnType)) {
                  const typeName = returnType.typeName;
                  // For now, just check that it's a Record type
                  // In the future, we could add more sophisticated type checking
                  if (!ts.isIdentifier(typeName) || typeName.text !== 'Record') {
                    errors.push('getAll should return Record<string, string>');
                  }
                } else {
                  errors.push('getAll should return Record<string, string>');
                }
              }
            } else {
              errors.push('getAll should be a function');
            }
          } else {
            errors.push('getAll should be a function');
          }
        }
      });
    }

    ts.forEachChild(node, visitNode);
  };

  visitNode(sourceFile);

  if (!hasGetAllExport) {
    errors.push('Module must export a getAll function');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validates that the module code matches our expected format
 * @param moduleCode The module code to validate
 * @returns True if valid, false otherwise
 */
export const validateModule = (moduleCode: string): boolean => {
  const result = validateModuleStructure(moduleCode);
  
  if (!result.isValid) {
    console.error('Module validation failed:');
    result.errors.forEach(error => console.error(`- ${error}`));
  }
  
  return result.isValid;
};
