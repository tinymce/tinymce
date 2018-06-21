import * as Arr from './Arr';
import * as Fun from './Fun';
import * as Obj from './Obj';
import * as Type from './Type';
import * as BagUtils from '../util/BagUtils';

export interface ContractCondition {
  label: string;
  validate: (value: any, key: string) => boolean;
};

type HandleFn = (required: string[], keys: string[]) => void;

// Ensure that the object has all required fields. They must be functions.
const base = function (handleUnsupported: HandleFn, required: string[]) {
  return baseWith(handleUnsupported, required, {
    validate: Type.isFunction,
    label: 'function'
  });
};

// Ensure that the object has all required fields. They must satisy predicates.
const baseWith = function (handleUnsupported: HandleFn, required: string[], pred: ContractCondition) {
  if (required.length === 0) throw new Error('You must specify at least one required field.');

  BagUtils.validateStrArr('required', required);

  BagUtils.checkDupes(required);

  return function <T> (obj: T) {
    const keys: string[] = Obj.keys(obj);

    // Ensure all required keys are present.
    const allReqd = Arr.forall(required, function (req) {
      return Arr.contains(keys, req);
    });

    if (! allReqd) BagUtils.reqMessage(required, keys);

    handleUnsupported(required, keys);
    
    const invalidKeys = Arr.filter(required, function (key) {
      return !pred.validate(obj[key], key);
    });

    if (invalidKeys.length > 0) BagUtils.invalidTypeMessage(invalidKeys, pred.label);

    return obj;
  };
};

const handleExact = function (required, keys) {
  const unsupported = Arr.filter(keys, function (key) {
    return !Arr.contains(required, key);
  });

  if (unsupported.length > 0) BagUtils.unsuppMessage(unsupported);
};

const allowExtra = Fun.noop;

export const exactly = (required: string[]) => base(handleExact, required);
export const ensure = (required: string[]) => base(allowExtra, required);
export const ensureWith = (required: string[], condition: ContractCondition) => baseWith(allowExtra, required, condition);
