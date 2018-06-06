import { DslType, FieldSchema, FieldProcessorAdt } from '@ephox/boulder';

const ComposeSchema: FieldProcessorAdt[] = [
  FieldSchema.strict('find')
];

export {
  ComposeSchema
};
