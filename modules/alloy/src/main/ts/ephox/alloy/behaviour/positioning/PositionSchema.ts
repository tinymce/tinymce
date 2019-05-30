import { FieldSchema, FieldProcessorAdt } from '@ephox/boulder';

export default [
  FieldSchema.defaulted('useFixed', false),
  FieldSchema.option('getBounds')
];