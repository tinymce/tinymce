import { FieldSchema, FieldProcessorAdt } from '@ephox/boulder';

export default [
  FieldSchema.defaulted('disabled', false),
  FieldSchema.option('disableClass')
] as FieldProcessorAdt[];