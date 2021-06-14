import { FieldProcessor, FieldSchema, StructureSchema, ValueType } from '@ephox/boulder';
import { Result } from '@ephox/katamari';

export default [
  FieldSchema.requiredOf('others', StructureSchema.setOf(Result.value, ValueType.anyValue()))
] as FieldProcessor[];