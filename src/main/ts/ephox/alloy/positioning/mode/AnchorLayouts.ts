import { FieldProcessorAdt, FieldSchema } from '@ephox/boulder';
import { Direction } from '@ephox/sugar';

const schema: () => FieldProcessorAdt = function () {
  return FieldSchema.optionObjOf('layouts', [
    FieldSchema.strict('onLtr'),
    FieldSchema.strict('onRtl')
  ]);
};

const get = function (component, info, defaultLtr, defaultRtl) {
  const ltr = info.layouts().map(function (ls) {
    return ls.onLtr();
  }).getOr(defaultLtr);

  const rtl = info.layouts().map(function (ls) {
    return ls.onRtl();
  }).getOr(defaultRtl);

  return Direction.onDirection(ltr, rtl)(component.element());
};

export {
  schema,
  get
};