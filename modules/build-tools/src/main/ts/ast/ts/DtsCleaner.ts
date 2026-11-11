import * as ts from 'typescript';

import { serialize } from './Serializer';

export interface CleanerOptions {
  readonly keepComments?: boolean;
  readonly keepVariables?: string[];
  readonly removeNamespaces?: string[];
}

const isNamed = (node: { name: ts.PropertyName | ts.BindingName }, names: string[]) =>
  node.name.kind === ts.SyntaxKind.Identifier ? names.indexOf(node.name.text) !== -1 : false;

const isVariableNamed = (statement: ts.VariableStatement, names: string[]) =>
  statement.declarationList.declarations.some((decl) => isNamed(decl, names));

const isExported = (node: { modifiers?: ts.ModifiersArray }): boolean =>
  node.modifiers && node.modifiers.some((mod) => mod.kind === ts.SyntaxKind.ExportKeyword);

// Strip out all comments, namespace, function and const declarations
export const clean = (ast: ts.SourceFile, options: CleanerOptions = {}): string => {
  const keepVariables = options.keepVariables || [];
  const removeNamespaces = options.removeNamespaces || [];

  const nodes: ts.Node[] = [];
  ts.forEachChild(ast, (node) => {
    switch (node.kind) {
      case ts.SyntaxKind.FunctionDeclaration:
      case ts.SyntaxKind.MethodDeclaration:
      case ts.SyntaxKind.PropertyDeclaration:
        const decl = node as any;
        if (isExported(decl) || isNamed(decl, keepVariables)) {
          nodes.push(node);
        }
        break;
      case ts.SyntaxKind.ModuleDeclaration:
        const module = node as ts.ModuleDeclaration;
        if (!isNamed(module, removeNamespaces)) {
          nodes.push(node);
        }
        break;
      case ts.SyntaxKind.VariableStatement:
        const statement = node as ts.VariableStatement;
        if (isVariableNamed(statement, keepVariables)) {
          nodes.push(node);
        }
        break;
      default:
        nodes.push(node);
    }
  });

  return serialize(ast, nodes, { removeComments: !options.keepComments });
};