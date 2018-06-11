import { FieldProcessorAdt, FieldSchema } from '@ephox/boulder';

const ComposeSchema: FieldProcessorAdt[] = [
  FieldSchema.strict('find')
];

export {
  ComposeSchema
};
