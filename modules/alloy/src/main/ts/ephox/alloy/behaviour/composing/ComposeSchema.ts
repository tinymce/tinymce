import { FieldProcessor, FieldSchema } from '@ephox/boulder';

const ComposeSchema: FieldProcessor[] = [
  FieldSchema.required('find')
];

export {
  ComposeSchema
};
