import { FieldProcessor, FieldSchema } from '@ephox/boulder';
import { Optional } from '@ephox/katamari';

import * as ComponentSchema from '../../core/ComponentSchema';
import { BodyComponent, BodyComponentSpec } from './BodyComponent';

type Alignment = 'start' | 'center' | 'end';

export interface LabelSpec {
  type: 'label';
  label: string;
  items: BodyComponentSpec[];
  align?: Alignment;
  for?: string;
}

export interface Label {
  type: 'label';
  label: string;
  items: BodyComponent[];
  align: Alignment;
  for: Optional<string>;
}

export const createLabelFields = (itemsField: FieldProcessor): FieldProcessor[] => [
  ComponentSchema.type,
  ComponentSchema.label,
  itemsField,
  FieldSchema.defaultedStringEnum('align', 'start', [ 'start', 'center', 'end' ]),
  FieldSchema.optionString('for')
];
