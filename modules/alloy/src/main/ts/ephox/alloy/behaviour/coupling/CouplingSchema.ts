import { FieldSchema, ValueSchema, StructureProcessor } from '@ephox/boulder';
import { Result } from '@ephox/katamari';

export default [
  FieldSchema.requiredOf('others', ValueSchema.setOf(Result.value, ValueSchema.anyValue()))
] as StructureProcessor[];