import { FieldSchema, FieldProcessorAdt } from '@ephox/boulder';
import { BodyComponentApi, BodyComponent } from './BodyComponent';

export interface BarApi {
  type: 'bar';
  items: BodyComponentApi[];
}

export interface Bar {
  type: 'bar';
  items: BodyComponent[];
}

export const createBarFields = (itemsField: FieldProcessorAdt) => [
  FieldSchema.strictString('type'),
  itemsField
];
