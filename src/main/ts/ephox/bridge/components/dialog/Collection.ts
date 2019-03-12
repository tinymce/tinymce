import { FieldProcessorAdt, FieldSchema, ValueSchema } from '@ephox/boulder';
import { Result } from '@ephox/katamari';

import { FormComponent, FormComponentApi, formComponentFields } from './FormComponent';

export interface CollectionApi extends FormComponentApi {
  type: 'collection';
  // TODO TINY-3229 implement collection columns properly
  // columns?: number | 'auto';
}

export interface Collection extends FormComponent {
  type: 'collection';
  columns: number | 'auto';
}

export const collectionFields: FieldProcessorAdt[] = formComponentFields.concat([
  FieldSchema.defaulted('columns', 'auto')
]);

export const collectionSchema = ValueSchema.objOf(collectionFields);

// TODO: Make type for CollectionItem
export const collectionDataProcessor = ValueSchema.arrOfObj([
  FieldSchema.strictString('value'),
  FieldSchema.strictString('text'),
  FieldSchema.strictString('icon')
]);

export const createCollection = (spec: CollectionApi): Result<Collection, ValueSchema.SchemaError<any>> => {
  return ValueSchema.asRaw<Collection>('collection', collectionSchema, spec);
};