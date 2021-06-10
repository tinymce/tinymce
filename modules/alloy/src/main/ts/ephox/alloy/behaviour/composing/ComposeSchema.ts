import { StructureProcessor, FieldSchema } from '@ephox/boulder';

const ComposeSchema: StructureProcessor[] = [
  FieldSchema.required('find')
];

export {
  ComposeSchema
};
