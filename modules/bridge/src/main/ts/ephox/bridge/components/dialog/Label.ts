import { FieldProcessor } from '@ephox/boulder';

import * as ComponentSchema from '../../core/ComponentSchema';
import { BodyComponent, BodyComponentSpec } from './BodyComponent';

export interface LabelSpec {
  type: 'label';
  label: string;
  items: BodyComponentSpec[];
}

export interface Label {
  uid: string;
  type: 'label';
  label: string;
  items: BodyComponent[];
}

export const createLabelFields = (itemsField: FieldProcessor): FieldProcessor[] => [
  ComponentSchema.uid,
  ComponentSchema.type,
  ComponentSchema.label,
  itemsField
];
