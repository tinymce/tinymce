import { FieldSchema, FieldProcessorAdt } from '@ephox/boulder';
import { window } from '@ephox/dom-globals';
import { Scroll } from '@ephox/sugar';

import * as Boxes from '../../alien/Boxes';

const defaultLazyViewport = (_component): Boxes.Bounds => {
  const scroll = Scroll.get();
  return Boxes.bounds(scroll.left(), scroll.top(), window.innerWidth, window.innerHeight);
};

export default [
  FieldSchema.optionObjOf('contextual', [
    FieldSchema.strict('fadeInClass'),
    FieldSchema.strict('fadeOutClass'),
    FieldSchema.strict('transitionClass'),
    FieldSchema.strict('lazyContext')
  ]),
  FieldSchema.defaulted('lazyViewport', defaultLazyViewport),
  FieldSchema.strict('leftAttr'),
  FieldSchema.strict('topAttr')
] as FieldProcessorAdt[];
