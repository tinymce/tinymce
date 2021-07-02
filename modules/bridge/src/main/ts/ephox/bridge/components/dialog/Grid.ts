import { FieldProcessor, FieldSchema } from '@ephox/boulder';

import { BodyComponent, BodyComponentSpec } from './BodyComponent';

export interface GridSpec {
  type: 'grid';
  columns: number;
  items: BodyComponentSpec[];
}

export interface Grid {
  type: 'grid';
  columns: number;
  items: BodyComponent[];
}

export const createGridFields = (itemsField: FieldProcessor): FieldProcessor[] => [
  FieldSchema.requiredString('type'),
  FieldSchema.requiredNumber('columns'),
  itemsField
];
