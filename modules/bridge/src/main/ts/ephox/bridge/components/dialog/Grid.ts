import { FieldSchema, FieldProcessorAdt } from '@ephox/boulder';
import { BodyComponentSpec, BodyComponent } from './BodyComponent';

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

export const createGridFields = (itemsField: FieldProcessorAdt) => [
  FieldSchema.strictString('type'),
  FieldSchema.strictNumber('columns'),
  itemsField
];
