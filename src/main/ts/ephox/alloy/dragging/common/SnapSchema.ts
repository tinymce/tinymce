import { FieldSchema } from '@ephox/boulder';
import { Fun } from '@ephox/katamari';
import { Scroll } from '@ephox/sugar';

import * as Fields from '../../data/Fields';
import { ViewportBox } from 'ephox/alloy/behaviour/docking/DockingTypes';

const defaultLazyViewport = (): ViewportBox => {
  const scroll = Scroll.get();

  return {
    x: scroll.left,
    y: scroll.top,
    width: Fun.constant(window.innerWidth),
    height: Fun.constant(window.innerHeight),
    bottom: Fun.constant(scroll.top + window.innerHeight)
  };
};

export default <any> FieldSchema.optionObjOf('snaps', [
  FieldSchema.strict('getSnapPoints'),
  Fields.onHandler('onSensor'),
  FieldSchema.strict('leftAttr'),
  FieldSchema.strict('topAttr'),
  FieldSchema.defaulted('lazyViewport', defaultLazyViewport)
]);