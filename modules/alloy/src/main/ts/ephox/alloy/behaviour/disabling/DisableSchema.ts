import { FieldProcessor, FieldSchema } from '@ephox/boulder';
import { Fun } from '@ephox/katamari';

import * as Fields from '../../data/Fields';

export default [
  FieldSchema.defaultedFunction('disabled', Fun.never),
  FieldSchema.defaulted('useNative', true),
  FieldSchema.option('disableClass'),
  Fields.onHandler('onDisabled'),
  Fields.onHandler('onEnabled')
] as FieldProcessor[];
