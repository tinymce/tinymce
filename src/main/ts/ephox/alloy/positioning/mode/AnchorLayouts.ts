import { FieldProcessorAdt, FieldSchema } from '@ephox/boulder';
import { Direction } from '@ephox/sugar';
import { AlloyComponent } from 'ephox/alloy/api/component/ComponentApi';
import { SugarElement } from 'ephox/alloy/alien/TypeDefinitions';
import { AnchorLayout } from 'ephox/alloy/positioning/layout/Layout';

const schema: () => FieldProcessorAdt = () => {
  return FieldSchema.optionObjOf('layouts', [
    FieldSchema.strict('onLtr'),
    FieldSchema.strict('onRtl')
  ]);
};

const get = (
  // TYPIFY
  component: AlloyComponent,
  info: any,
  defaultLtr: AnchorLayout[],
  defaultRtl: AnchorLayout[]
): AnchorLayout[] => {
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