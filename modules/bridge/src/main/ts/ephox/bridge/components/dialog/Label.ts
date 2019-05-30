import { BodyComponentApi, BodyComponent } from './BodyComponent';
import { FieldSchema, FieldProcessorAdt } from '@ephox/boulder';

export interface LabelApi {
  type: 'label';
  label: string;
  items: BodyComponentApi[];
}

export interface Label {
  type: 'label';
  label: string;
  items: BodyComponent[];
}

export const createLabelFields = (itemsField: FieldProcessorAdt) => {
  return [
    FieldSchema.strictString('type'),
    FieldSchema.strictString('label'),
    itemsField
  ];
};
