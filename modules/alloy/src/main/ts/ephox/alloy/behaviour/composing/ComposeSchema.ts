import { ValueProcessorTypes, FieldSchema } from '@ephox/boulder';

const ComposeSchema: ValueProcessorTypes[] = [
  FieldSchema.strict('find')
];

export {
  ComposeSchema
};
