import { FieldSchema, ValueSchema } from '@ephox/boulder';
import { Result } from '@ephox/katamari';

import * as Fields from '../../data/Fields';

export default [
  FieldSchema.strictOf('channels', ValueSchema.setOf(
    // Allow any keys.
    Result.value,
    ValueSchema.objOfOnly([
      Fields.onStrictHandler('onReceive'),
      FieldSchema.defaulted('schema', ValueSchema.anyValue())
    ])
  ))
];
