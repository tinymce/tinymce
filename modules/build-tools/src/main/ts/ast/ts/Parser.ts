
import * as ts from 'typescript';

const parseConfigHost: ts.ParseConfigHost = {
  useCaseSensitiveFileNames: ts.sys.useCaseSensitiveFileNames,
  readDirectory: ts.sys.readDirectory,
  fileExists: ts.sys.fileExists,
  readFile: ts.sys.readFile,
};

export const parse = (code: string, filename: string = 'code.ts'): ts.Program => {
  const configFileName = ts.findConfigFile('.', ts.sys.fileExists);
  const configResult = ts.readConfigFile(configFileName, ts.sys.readFile);
  const jsonResult = ts.parseJsonConfigFileContent(configResult.config, parseConfigHost, '.');
  const compilerOptions = jsonResult.options;

  // Create a virtual host to resolve the file
  const host = ts.createCompilerHost(compilerOptions);
  const origGetSourceFile = host.getSourceFile;
  host.getSourceFile = (name, languageVersion, onError, shouldCreateNewSourceFile) => {
    if (name === filename) {
      return ts.createSourceFile(filename, code, compilerOptions.target, true);
    } else {
      return origGetSourceFile(name, languageVersion, onError, shouldCreateNewSourceFile);
    }
  };

  // Create the program
  return ts.createProgram([ filename ], compilerOptions, host);
};