import { ValueProcessor, FieldSchema } from '@ephox/boulder';

const ComposeSchema: ValueProcessor[] = [
  FieldSchema.strict('find')
];

export {
  ComposeSchema
};
