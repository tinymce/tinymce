import { FieldProcessorAdt, FieldSchema, ValueSchema } from '@ephox/boulder';
import { Result } from '@ephox/katamari';

import { FormComponentWithLabel, FormComponentWithLabelSpec, formComponentWithLabelFields } from './FormComponent';

export interface CollectionSpec extends FormComponentWithLabelSpec {
  type: 'collection';
  // TODO TINY-3229 implement collection columns properly
  // columns?: number | 'auto';
}

export interface Collection extends FormComponentWithLabel {
  type: 'collection';
  columns: number | 'auto';
}

const collectionFields: FieldProcessorAdt[] = formComponentWithLabelFields.concat([
  FieldSchema.defaulted('columns', 'auto')
]);

export const collectionSchema = ValueSchema.objOf(collectionFields);

// TODO: Make type for CollectionItem
export const collectionDataProcessor = ValueSchema.arrOfObj([
  FieldSchema.strictString('value'),
  FieldSchema.strictString('text'),
  FieldSchema.strictString('icon')
]);

export const createCollection = (spec: CollectionSpec): Result<Collection, ValueSchema.SchemaError<any>> =>
  ValueSchema.asRaw<Collection>('collection', collectionSchema, spec);
