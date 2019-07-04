import { FieldSchema, FieldProcessorAdt } from '@ephox/boulder';
import { BodyComponentApi, BodyComponent } from './BodyComponent';

export interface BarApi {
  type: 'bar';
  classes?: string[];
  items: BodyComponentApi[];
}

export interface Bar {
  type: 'bar';
  classes: string[];
  items: BodyComponent[];
}

export const createBarFields = (itemsField: FieldProcessorAdt) => {
  return [
    FieldSchema.strictString('type'),
    FieldSchema.defaulted('classes', []),
    itemsField
  ];
};
