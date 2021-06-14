import { FieldSchema, ValueSchema, ValueType } from '@ephox/boulder';
import { Result } from '@ephox/katamari';
import * as Fields from '../../data/Fields';

export default [
  FieldSchema.requiredOf('channels', ValueSchema.setOf(
    // Allow any keys.
    Result.value,
    ValueSchema.objOfOnly([
      Fields.onStrictHandler('onReceive'),
      FieldSchema.defaulted('schema', ValueType.anyValue())
    ])
  ))
];
