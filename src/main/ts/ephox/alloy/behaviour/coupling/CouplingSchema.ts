import { FieldSchema, ValueSchema, FieldProcessorAdt } from '@ephox/boulder';
import { Result } from '@ephox/katamari';

export default <any> [
  FieldSchema.strictOf('others', ValueSchema.setOf(Result.value, ValueSchema.anyValue()))
] as FieldProcessorAdt[];