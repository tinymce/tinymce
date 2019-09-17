import { FieldProcessorAdt, FieldSchema, ValueSchema } from '@ephox/boulder';
import { window } from '@ephox/dom-globals';
import { VisualViewport } from '@ephox/sugar';

import * as Boxes from '../../alien/Boxes';
import * as Fields from '../../data/Fields';

const defaultLazyViewport = (_component): Boxes.Bounds => {
  return VisualViewport.getBounds(window);
};

export default [
  FieldSchema.optionObjOf('contextual', [
    FieldSchema.strictString('fadeInClass'),
    FieldSchema.strictString('fadeOutClass'),
    FieldSchema.strictString('transitionClass'),
    FieldSchema.strictFunction('lazyContext'),
    Fields.onHandler('onShow'),
    Fields.onHandler('onShown'),
    Fields.onHandler('onHide'),
    Fields.onHandler('onHidden')
  ]),
  FieldSchema.defaultedFunction('lazyViewport', defaultLazyViewport),
  FieldSchema.strictString('leftAttr'),
  FieldSchema.strictString('topAttr'),
  FieldSchema.strictString('positionAttr'),
  FieldSchema.defaultedArrayOf('modes', ['top', 'bottom'], ValueSchema.string),
  Fields.onHandler('onDocked'),
  Fields.onHandler('onUndocked')
] as FieldProcessorAdt[];