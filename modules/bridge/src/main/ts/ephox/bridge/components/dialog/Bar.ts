import { FieldProcessor, FieldSchema } from '@ephox/boulder';

import { BodyComponent, BodyComponentSpec } from './BodyComponent';

export interface BarSpec {
  type: 'bar';
  items: BodyComponentSpec[];
}

export interface Bar {
  type: 'bar';
  items: BodyComponent[];
}

export const createBarFields = (itemsField: FieldProcessor): FieldProcessor[] => [
  FieldSchema.requiredString('type'),
  itemsField
];
