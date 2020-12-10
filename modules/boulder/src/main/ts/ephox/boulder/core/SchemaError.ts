import { SimpleResult } from '../alien/SimpleResult';
import { formatObj } from '../format/PrettyPrinter';

export interface SchemaError {
  readonly path: string[];
  readonly getErrorInfo: () => string;
}

const nu = function <T> (path: string[], getErrorInfo: () => string): SimpleResult<SchemaError[], T> {
  return SimpleResult.serror([{
    path,
    // This is lazy so that it isn't calculated unnecessarily
    getErrorInfo
  }]);
};

const missingStrict = function <T> (path: string[], key: string, obj: any): SimpleResult<SchemaError[], T> {
  return nu(path, () => {
    return 'Could not find valid *strict* value for "' + key + '" in ' + formatObj(obj);
  });
};

const missingKey = function <T> (path: string[], key: string): SimpleResult<SchemaError[], T> {
  return nu(path, () => {
    return 'Choice schema did not contain choice key: "' + key + '"';
  });
};

const missingBranch = function <T> (path: string[], branches: Record<string, any>, branch: string): SimpleResult<SchemaError[], T> {
  return nu(path, () => {
    return 'The chosen schema: "' + branch + '" did not exist in branches: ' + formatObj(branches);
  });
};

const unsupportedFields = function <T> (path: string[], unsupported: string[]): SimpleResult<SchemaError[], T> {
  return nu(path, () => {
    return 'There are unsupported fields: [' + unsupported.join(', ') + '] specified';
  });
};

const custom = function <T> (path: string[], err: string): SimpleResult<SchemaError[], T> {
  return nu(path, () => { return err; });
};

const toString = function (error: SchemaError): string {
  return 'Failed path: (' + error.path.join(' > ') + ')\n' + error.getErrorInfo();
};

export {
  missingStrict,
  missingKey,
  missingBranch,
  unsupportedFields,
  custom,
  toString
};
