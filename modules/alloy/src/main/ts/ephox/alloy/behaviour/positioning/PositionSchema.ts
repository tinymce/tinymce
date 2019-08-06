import { FieldSchema } from '@ephox/boulder';

export default [
  FieldSchema.defaulted('useFixed', false),
  FieldSchema.option('getBounds')
];
