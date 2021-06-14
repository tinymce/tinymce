import { FieldProcessor, FieldSchema, ValueSchema, ValueType } from '@ephox/boulder';
import { Result } from '@ephox/katamari';

export default [
  FieldSchema.requiredOf('others', ValueSchema.setOf(Result.value, ValueType.anyValue()))
] as FieldProcessor[];