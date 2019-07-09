import { formatObj } from '../format/PrettyPrinter';
import { SimpleResult } from '../alien/SimpleResult';

const nu = function (path, getErrorInfo) {
  return SimpleResult.serror([{
    path,
    // This is lazy so that it isn't calculated unnecessarily
    getErrorInfo
  }]);
};

const missingStrict = function (path, key, obj) {
  return nu(path, function () {
    return 'Could not find valid *strict* value for "' + key + '" in ' + formatObj(obj);
  });
};

const missingKey = function (path, key) {
  return nu(path, function () {
    return 'Choice schema did not contain choice key: "' + key + '"';
  });
};

const missingBranch = function (path, branches, branch) {
  return nu(path, function () {
    return 'The chosen schema: "' + branch + '" did not exist in branches: ' + formatObj(branches);
  });
};

const unsupportedFields = function (path, unsupported) {
  return nu(path, function () {
    return 'There are unsupported fields: [' + unsupported.join(', ') + '] specified';
  });
};

const custom = function (path, err) {
  return nu(path, function () { return err; });
};

const toString = function (error) {
  return 'Failed path: ('  + error.path.join(' > ') + ')\n' + error.getErrorInfo();
};

export {
  missingStrict,
  missingKey,
  missingBranch,
  unsupportedFields,
  custom,
  toString
};
