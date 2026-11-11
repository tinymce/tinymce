import * as ts from 'typescript';

export const serialize = (sourceFile: ts.SourceFile, statements: ArrayLike<ts.Node>, options: ts.PrinterOptions): string => {
  const printer = ts.createPrinter({
    newLine: ts.NewLineKind.LineFeed,
    ...options
  });

  return Array.from(statements).map((node) => {
    return printer.printNode(ts.EmitHint.Unspecified, node, sourceFile);
  }).join('\n');
};