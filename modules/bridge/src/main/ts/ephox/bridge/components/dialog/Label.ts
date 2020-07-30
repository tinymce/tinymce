import { BodyComponentSpec, BodyComponent } from './BodyComponent';
import { FieldSchema, FieldProcessorAdt } from '@ephox/boulder';

export interface LabelSpec {
  type: 'label';
  label: string;
  items: BodyComponentSpec[];
}

export interface Label {
  type: 'label';
  label: string;
  items: BodyComponent[];
}

export const createLabelFields = (itemsField: FieldProcessorAdt) => [
  FieldSchema.strictString('type'),
  FieldSchema.strictString('label'),
  itemsField
];
