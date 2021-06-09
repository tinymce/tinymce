import { FieldSchema, ValueSchema, ValueProcessor } from '@ephox/boulder';
import { Result } from '@ephox/katamari';

export default [
  FieldSchema.strictOf('others', ValueSchema.setOf(Result.value, ValueSchema.anyValue()))
] as ValueProcessor[];