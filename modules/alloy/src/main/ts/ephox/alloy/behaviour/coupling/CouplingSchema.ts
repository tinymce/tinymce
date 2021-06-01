import { FieldSchema, ValueSchema, ValueProcessorTypes } from '@ephox/boulder';
import { Result } from '@ephox/katamari';

export default [
  FieldSchema.strictOf('others', ValueSchema.setOf(Result.value, ValueSchema.anyValue()))
] as ValueProcessorTypes[];