import { FieldSchema } from '@ephox/boulder';
import { window } from '@ephox/dom-globals';
import { VisualViewport } from '@ephox/sugar';

import * as Fields from '../../data/Fields';
import { Bounds } from '../../alien/Boxes';

const defaultLazyViewport = (): Bounds => {
  return VisualViewport.getBounds(window);
};

export default FieldSchema.optionObjOf('snaps', [
  FieldSchema.strict('getSnapPoints'),
  Fields.onHandler('onSensor'),
  FieldSchema.strict('leftAttr'),
  FieldSchema.strict('topAttr'),
  FieldSchema.defaulted('lazyViewport', defaultLazyViewport)
]);