import { FieldSchema } from '@ephox/boulder';

export default <any> [
  FieldSchema.defaulted('disabled', false),
  FieldSchema.option('disableClass')
];