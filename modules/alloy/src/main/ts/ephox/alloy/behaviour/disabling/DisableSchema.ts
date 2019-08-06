import { FieldSchema, FieldProcessorAdt } from '@ephox/boulder';

import * as Fields from '../../data/Fields';

export default [
  FieldSchema.defaulted('disabled', false),
  FieldSchema.defaulted('useNative', true),
  FieldSchema.option('disableClass'),
  Fields.onHandler('onDisabled'),
  Fields.onHandler('onEnabled')
] as FieldProcessorAdt[];
