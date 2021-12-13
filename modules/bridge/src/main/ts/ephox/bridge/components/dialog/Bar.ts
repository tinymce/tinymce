import { FieldProcessor } from '@ephox/boulder';

import * as ComponentSchema from '../../core/ComponentSchema';
import { BodyComponent, BodyComponentSpec } from './BodyComponent';

export interface BarSpec {
  type: 'bar';
  items: BodyComponentSpec[];
}

export interface Bar {
  uid: string;
  type: 'bar';
  items: BodyComponent[];
}

export const createBarFields = (itemsField: FieldProcessor): FieldProcessor[] => [
  ComponentSchema.uid,
  ComponentSchema.type,
  itemsField
];
