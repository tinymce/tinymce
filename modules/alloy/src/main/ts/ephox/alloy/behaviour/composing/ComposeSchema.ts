import { StructureProcessor, FieldSchema } from '@ephox/boulder';

const ComposeSchema: StructureProcessor[] = [
  FieldSchema.strict('find')
];

export {
  ComposeSchema
};
