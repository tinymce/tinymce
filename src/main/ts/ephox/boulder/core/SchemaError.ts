import PrettyPrinter from '../format/PrettyPrinter';
import { Result } from '@ephox/katamari';

var nu = function (path, getErrorInfo) {
  return Result.error([{
    path: path,
    // This is lazy so that it isn't calculated unnecessarily
    getErrorInfo: getErrorInfo
  }]);
};

var missingStrict = function (path, key, obj) {
  return nu(path, function () {
    return 'Could not find valid *strict* value for "' + key + '" in ' + PrettyPrinter.formatObj(obj);
  });
};

var missingKey = function (path, key) {
  return nu(path, function () {
    return 'Choice schema did not contain choice key: "' + key + '"';
  });
};

var missingBranch = function (path, branches, branch) {
  return nu(path, function () {
    return 'The chosen schema: "' + branch + '" did not exist in branches: ' + PrettyPrinter.formatObj(branches);
  });
};

var unsupportedFields = function (path, unsupported) {
  return nu(path, function () {
    return 'There are unsupported fields: [' + unsupported.join(', ') + '] specified';
  });
};

var custom = function (path, err) {
  return nu(path, function () { return err; });
};

var toString = function (error) {
  return 'Failed path: ('  + error.path.join(' > ') + ')\n' + error.getErrorInfo();
};

export default <any> {
  missingStrict: missingStrict,
  missingKey: missingKey,
  missingBranch: missingBranch,
  unsupportedFields: unsupportedFields,
  custom: custom,
  toString: toString
};