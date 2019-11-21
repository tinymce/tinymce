import { FieldProcessorAdt, FieldSchema } from '@ephox/boulder';
import { Direction, Element } from '@ephox/sugar';

import { AnchorLayout } from '../layout/LayoutTypes';
import { HasLayoutAnchor } from './Anchoring';
import { Option } from '@ephox/katamari';
import { isBottomToTopDir } from './VerticalDir';

const schema: () => FieldProcessorAdt = () => {
  return FieldSchema.optionObjOf('layouts', [
    FieldSchema.strict('onLtr'),
    FieldSchema.strict('onRtl'),
    FieldSchema.option('onBottomLtr'),
    FieldSchema.option('onBottomRtl')
  ]);
};

const get = (
  elem: Element,
  info: HasLayoutAnchor,
  defaultLtr: AnchorLayout[],
  defaultRtl: AnchorLayout[],
  defaultBottomLtr: AnchorLayout[],
  defaultBottomRtl: AnchorLayout[],
  dirElement: Option<Element>
): AnchorLayout[] => {
  const isBottomToTop = dirElement.map(isBottomToTopDir).getOr(false);

  const customLtr = info.layouts.map((ls) => ls.onLtr(elem));
  const customRtl = info.layouts.map((ls) => ls.onRtl(elem));

  const ltr = isBottomToTop ?
    info.layouts.bind((ls) => ls.onBottomLtr.map((f) => f(elem)))
    .or(customLtr)
    .getOr(defaultBottomLtr) :
    customLtr.getOr(defaultLtr);

  const rtl = isBottomToTop ?
    info.layouts.bind((ls) => ls.onBottomRtl.map((f) => f(elem)))
    .or(customRtl)
    .getOr(defaultBottomRtl) :
    customRtl.getOr(defaultRtl);

  const f = Direction.onDirection(ltr, rtl);
  return f(elem);
};

export {
  schema,
  get
};
