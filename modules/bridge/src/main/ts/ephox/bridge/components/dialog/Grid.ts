import { FieldSchema, FieldProcessorAdt } from '@ephox/boulder';
import { BodyComponentApi, BodyComponent } from './BodyComponent';

export interface GridApi {
  type: 'grid';
  columns: number;
  items: BodyComponentApi[];
}

export interface Grid {
  type: 'grid';
  columns: number;
  items: BodyComponent[];
}

export const createGridFields = (itemsField: FieldProcessorAdt) => {
  return [
    FieldSchema.strictString('type'),
    FieldSchema.strictNumber('columns'),
    itemsField
  ];
};
