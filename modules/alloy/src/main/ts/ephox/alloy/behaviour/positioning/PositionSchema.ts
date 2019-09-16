import { FieldSchema } from '@ephox/boulder';
import { Fun } from '@ephox/katamari';

export default [
  FieldSchema.defaulted('useFixed', Fun.never),
  FieldSchema.option('getBounds')
];
