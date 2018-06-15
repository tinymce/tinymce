import { FieldProcessorAdt, FieldSchema } from '@ephox/boulder';
import { Direction } from '@ephox/sugar';

const schema: () => FieldProcessorAdt = () => {
  return FieldSchema.optionObjOf('layouts', [
    FieldSchema.strict('onLtr'),
    FieldSchema.strict('onRtl')
  ]);
};

const get = (component, info, defaultLtr, defaultRtl) => {
  const ltr = info.layouts().map((ls) => {
    return ls.onLtr();
  }).getOr(defaultLtr);

  const rtl = info.layouts().map((ls) => {
    return ls.onRtl();
  }).getOr(defaultRtl);

  return Direction.onDirection(ltr, rtl)(component.element());
};

export {
  schema,
  get
};