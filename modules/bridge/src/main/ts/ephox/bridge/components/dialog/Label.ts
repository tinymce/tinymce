import { FieldProcessor, FieldSchema } from '@ephox/boulder';

import * as ComponentSchema from '../../core/ComponentSchema';
import { BodyComponent, BodyComponentSpec } from './BodyComponent';
import { Optional } from '@ephox/katamari';

type Alignment = 'start' | 'center' | 'end';

export interface LabelSpec {
  type: 'label';
  label: string;
  items?: BodyComponentSpec[];
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
  ComponentSchema.optionalFor,
  //items still required I guess??? it is called like that: createLabelFields(createItemsField('label'))
  itemsField,
  FieldSchema.defaultedStringEnum('align', 'start', [ 'start', 'center', 'end' ])
];
