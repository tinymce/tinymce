import Arr from '../api/Arr';
import Fun from '../api/Fun';
import Obj from '../api/Obj';
import { Option } from '../api/Option';
import BagUtils from '../util/BagUtils';



export default function (required: string[], optional: string[]) {
  var everything = required.concat(optional);
  if (everything.length === 0) throw new Error('You must specify at least one required or optional field.');

  BagUtils.validateStrArr('required', required);
  BagUtils.validateStrArr('optional', optional);

  BagUtils.checkDupes(everything);

  return function (obj: {}) {
    var keys: string[] = Obj.keys(obj);

    // Ensure all required keys are present.
    var allReqd = Arr.forall(required, function (req) {
      return Arr.contains(keys, req);
    });

    if (! allReqd) BagUtils.reqMessage(required, keys);

    var unsupported = Arr.filter(keys, function (key) {
      return !Arr.contains(everything, key);
    });

    if (unsupported.length > 0) BagUtils.unsuppMessage(unsupported);

    var r: {[key: string]: () => any} = {};
    Arr.each(required, function (req) {
      r[req] = Fun.constant(obj[req]);
    });

    Arr.each(optional, function (opt) {
      r[opt] = Fun.constant(Object.prototype.hasOwnProperty.call(obj, opt) ? Option.some(obj[opt]): Option.none());
    });

    return r;
  };
};