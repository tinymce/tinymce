import { FieldSchema } from '@ephox/boulder';
import { Direction } from '@ephox/sugar';

var schema = function () {
  return FieldSchema.optionObjOf('layouts', [
    FieldSchema.strict('onLtr'),
    FieldSchema.strict('onRtl')
  ]);
};

var get = function (component, info, defaultLtr, defaultRtl) {
  var ltr = info.layouts().map(function (ls) {
    return ls.onLtr();
  }).getOr(defaultLtr);

  var rtl = info.layouts().map(function (ls) {
    return ls.onRtl();
  }).getOr(defaultRtl);

  return Direction.onDirection(ltr, rtl)(component.element());
};

export default <any> {
  schema: schema,
  get: get
};