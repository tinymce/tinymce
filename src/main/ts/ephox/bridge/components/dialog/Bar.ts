import { FieldSchema, FieldProcessorAdt } from '@ephox/boulder';
import { BodyComponentApi, BodyComponent } from './BodyComponent';

export interface BarApi {
  type: 'grid';
  items: BodyComponentApi[];
}

export interface Bar {
  type: 'grid';
  items: BodyComponent[];
}

export const createBarFields = (itemsField: FieldProcessorAdt) => {
  return [
    FieldSchema.strictString('type'),
    itemsField
  ];
};
