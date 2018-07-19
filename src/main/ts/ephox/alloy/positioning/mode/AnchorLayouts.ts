import { FieldProcessorAdt, FieldSchema } from '@ephox/boulder';
import { Direction, Element } from '@ephox/sugar';
import { AlloyComponent } from '../../api/component/ComponentApi';
import { AnchorLayout } from '../../positioning/layout/Layout';
import { HasLayoutAnchor } from 'ephox/alloy/positioning/mode/Anchoring';

const schema: () => FieldProcessorAdt = () => {
  return FieldSchema.optionObjOf('layouts', [
    FieldSchema.strict('onLtr'),
    FieldSchema.strict('onRtl')
  ]);
};

const get = (
  component: AlloyComponent,
  info: HasLayoutAnchor,
  defaultLtr: AnchorLayout[],
  defaultRtl: AnchorLayout[]
): AnchorLayout[] => {
  const ltr = info.layouts().map((ls) => {
    return ls.onLtr()(component.element());
  }).getOr(defaultLtr);

  const rtl = info.layouts().map((ls) => {
    return ls.onRtl()(component.element());
  }).getOr(defaultRtl);

  const f = Direction.onDirection(ltr, rtl);
  return f(component.element());
};

export {
  schema,
  get
};