import { FieldProcessorAdt, FieldSchema } from '@ephox/boulder';
import { BodyComponent, BodyComponentSpec } from './BodyComponent';

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
