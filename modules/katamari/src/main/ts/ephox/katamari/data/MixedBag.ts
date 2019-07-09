import * as Arr from '../api/Arr';
import * as Fun from '../api/Fun';
import * as Obj from '../api/Obj';
import { Option } from '../api/Option';
import * as BagUtils from '../util/BagUtils';

export const MixedBag = function <T = {[key: string]: () => any}> (required: string[], optional: string[]): (obj: {}) => T {
  const everything = required.concat(optional);
  if (everything.length === 0) {
    throw new Error('You must specify at least one required or optional field.');
  }

  BagUtils.validateStrArr('required', required);
  BagUtils.validateStrArr('optional', optional);

  BagUtils.checkDupes(everything);

  return function (obj: {}) {
    const keys: string[] = Obj.keys(obj);

    // Ensure all required keys are present.
    const allReqd = Arr.forall(required, function (req) {
      return Arr.contains(keys, req);
    });

    if (! allReqd) {
      BagUtils.reqMessage(required, keys);
    }

    const unsupported = Arr.filter(keys, function (key) {
      return !Arr.contains(everything, key);
    });

    if (unsupported.length > 0) {
      BagUtils.unsuppMessage(unsupported);
    }

    const r: {[key: string]: () => any} = {};
    Arr.each(required, function (req) {
      r[req] = Fun.constant(obj[req]);
    });

    Arr.each(optional, function (opt) {
      r[opt] = Fun.constant(Object.prototype.hasOwnProperty.call(obj, opt) ? Option.some(obj[opt]) : Option.none());
    });

    return <any> r;
  };
};
