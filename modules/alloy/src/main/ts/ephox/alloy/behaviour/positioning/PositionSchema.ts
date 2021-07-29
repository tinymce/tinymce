import { FieldSchema } from '@ephox/boulder';
import { Fun } from '@ephox/katamari';

export const PositionSchema = [
  FieldSchema.defaulted('useFixed', Fun.never),
  FieldSchema.option('getBounds')
];
