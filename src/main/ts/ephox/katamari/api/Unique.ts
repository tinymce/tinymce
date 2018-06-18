import Arr from './Arr';
import Obj from './Obj';

var stringArray = function(a: string[]): string[] {
  var all = {};
  Arr.each(a, function(key) {
    all[key] = {};
  });
  return Obj.keys(all);
};

export default {
  stringArray: stringArray
};