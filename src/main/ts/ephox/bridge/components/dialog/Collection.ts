import { FieldProcessorAdt, FieldSchema, ValueSchema } from '@ephox/boulder';
import { Result } from '@ephox/katamari';

import { FormComponent, FormComponentApi, formComponentFields } from './FormComponent';

export interface CollectionApi extends FormComponentApi {
  type: 'collection';
  columns?: number | 'auto';
}

export interface Collection extends FormComponent {
  type: 'collection';
  columns: number | 'auto';
}

export const collectionFields: FieldProcessorAdt[] = formComponentFields.concat([
  FieldSchema.defaulted('columns', 1)
]);

export const collectionSchema = ValueSchema.objOf(collectionFields);

// TODO: Make type for CollectionItem
export const collectionDataProcessor = ValueSchema.arrOfObj([
  FieldSchema.strictString('value'),
  FieldSchema.optionString('text'),
  FieldSchema.optionString('icon')
]);

export const createCollection = (spec: CollectionApi): Result<Collection, ValueSchema.SchemaError<any>> => {
  return ValueSchema.asRaw<Collection>('collection', collectionSchema, spec);
};