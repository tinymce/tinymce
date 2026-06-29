import { type FieldProcessor, FieldSchema } from '@ephox/boulder';

export default [
  FieldSchema.requiredFunction('resize')
] as FieldProcessor[];
