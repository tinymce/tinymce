import { FieldSchema } from '@ephox/boulder';
import { FieldProcessorAdt } from '@ephox/boulder/lib/main/ts/ephox/boulder/api/DslType';

const ComposeSchema: FieldProcessorAdt[] = [
  FieldSchema.strict('find')
];

export {
  ComposeSchema
};
