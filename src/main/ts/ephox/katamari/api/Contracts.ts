import Arr from './Arr';
import Fun from './Fun';
import Obj from './Obj';
import Type from './Type';
import BagUtils from '../util/BagUtils';

// Ensure that the object has all required fields. They must be functions.
var base = function (handleUnsupported, required) {
  return baseWith(handleUnsupported, required, {
    validate: Type.isFunction,
    label: 'function'
  });
};

// Ensure that the object has all required fields. They must satisy predicates.
var baseWith = function (handleUnsupported, required, pred) {
  if (required.length === 0) throw new Error('You must specify at least one required field.');

  BagUtils.validateStrArr('required', required);

  BagUtils.checkDupes(required);

  return function (obj) {
    var keys = Obj.keys(obj);

    // Ensure all required keys are present.
    var allReqd = Arr.forall(required, function (req) {
      return Arr.contains(keys, req);
    });

    if (! allReqd) BagUtils.reqMessage(required, keys);

    handleUnsupported(required, keys);
    
    var invalidKeys = Arr.filter(required, function (key) {
      return !pred.validate(obj[key], key);
    });

    if (invalidKeys.length > 0) BagUtils.invalidTypeMessage(invalidKeys, pred.label);

    return obj;
  };
};

var handleExact = function (required, keys) {
  var unsupported = Arr.filter(keys, function (key) {
    return !Arr.contains(required, key);
  });

  if (unsupported.length > 0) BagUtils.unsuppMessage(unsupported);
};

var allowExtra = Fun.noop;

export default <any> {
  exactly: Fun.curry(base, handleExact),
  ensure: Fun.curry(base, allowExtra),
  ensureWith: Fun.curry(baseWith, allowExtra)
};