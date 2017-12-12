import { FieldSchema } from '@ephox/boulder';
import { Arr } from '@ephox/katamari';
import { Fun } from '@ephox/katamari';

var field = function (name, forbidden) {
  return FieldSchema.defaultedObjOf(name, { }, Arr.map(forbidden, function (f) {
    return FieldSchema.forbid(f.name(), 'Cannot configure ' + f.name() + ' for ' + name);
  }).concat([
    FieldSchema.state('dump', Fun.identity)
  ]));
};

var get = function (data) {
  return data.dump();
};

export default <any> {
  field: field,
  get: get
};