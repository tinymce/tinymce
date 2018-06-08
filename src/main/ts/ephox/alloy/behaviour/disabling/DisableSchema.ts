import { FieldSchema, FieldProcessorAdt } from '@ephox/boulder';

export default <any> [
  FieldSchema.defaulted('disabled', false),
  FieldSchema.option('disableClass')
] as FieldProcessorAdt[];