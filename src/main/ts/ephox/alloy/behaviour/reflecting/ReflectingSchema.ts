import { FieldSchema } from '@ephox/boulder';

export default [
  FieldSchema.strict('channel'),
  FieldSchema.option('renderComponents'),
  FieldSchema.option('updateState'),
  FieldSchema.option('initialData')
];