import { DslType, FieldSchema } from '@ephox/boulder';

const ComposeSchema: DslType.FieldProcessorAdt[] = [
  FieldSchema.strict('find')
];

export {
  ComposeSchema
};
