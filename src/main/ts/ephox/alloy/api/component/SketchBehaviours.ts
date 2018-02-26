import { FieldSchema } from '@ephox/boulder';
import { Arr, Fun } from '@ephox/katamari';

const field = function (name, forbidden) {
  return FieldSchema.defaultedObjOf(name, { }, Arr.map(forbidden, function (f) {
    return FieldSchema.forbid(f.name(), 'Cannot configure ' + f.name() + ' for ' + name);
  }).concat([
    FieldSchema.state('dump', Fun.identity)
  ]));
};

const get = function (data) {
  return data.dump();
};

export default <any> {
  field,
  get
};