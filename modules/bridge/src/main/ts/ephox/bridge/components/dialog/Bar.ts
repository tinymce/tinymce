import { FieldSchema, ValueProcessor } from '@ephox/boulder';
import { BodyComponentSpec, BodyComponent } from './BodyComponent';

export interface BarSpec {
  type: 'bar';
  items: BodyComponentSpec[];
}

export interface Bar {
  type: 'bar';
  items: BodyComponent[];
}

export const createBarFields = (itemsField: ValueProcessor): ValueProcessor[] => [
  FieldSchema.strictString('type'),
  itemsField
];
