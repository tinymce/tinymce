import { FieldSchema } from '@ephox/boulder';

export default [
  FieldSchema.strict('channel'),
  FieldSchema.strict('renderComponents'),
  FieldSchema.option('initialData'),
  FieldSchema.defaulted('prepare', (c, d) => d)
];