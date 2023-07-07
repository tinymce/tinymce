import { FieldProcessor, FieldSchema } from '@ephox/boulder';

import * as ComponentSchema from '../../core/ComponentSchema';
import { BodyComponent, BodyComponentSpec } from './BodyComponent';

export interface LabelSpec {
  type: 'label';
  label: string;
  items: BodyComponentSpec[];
  align?: 'start' | 'end';
}

export interface Label {
  type: 'label';
  label: string;
  items: BodyComponent[];
  align: 'start' | 'end';
}

export const createLabelFields = (itemsField: FieldProcessor): FieldProcessor[] => [
  ComponentSchema.type,
  ComponentSchema.label,
  itemsField,
  FieldSchema.defaultedStringEnum('align', 'start', [ 'start', 'end' ])
];
