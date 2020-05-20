import { FieldProcessorAdt, FieldSchema, ValueSchema } from '@ephox/boulder';
import { Result, Fun } from '@ephox/katamari';

import { FormComponentWithLabel, FormComponentWithLabelApi, formComponentWithLabelFields } from './FormComponent';

export interface CollectionApi extends FormComponentWithLabelApi {
  type: 'collection';
  // TODO TINY-3229 implement collection columns properly
  // columns?: number | 'auto';
  onFocus?: (value: string) => void;
}

export interface Collection extends FormComponentWithLabel {
  type: 'collection';
  columns: number | 'auto';
  onFocus: (value: string) => void;
}

const collectionFields: FieldProcessorAdt[] = formComponentWithLabelFields.concat([
  FieldSchema.defaulted('columns', 'auto'),
  FieldSchema.defaulted('onFocus', Fun.noop)
]);

export const collectionSchema = ValueSchema.objOf(collectionFields);

// TODO: Make type for CollectionItem
export const collectionDataProcessor = ValueSchema.arrOfObj([
  FieldSchema.strictString('value'),
  FieldSchema.strictString('text'),
  FieldSchema.strictString('icon')
]);

export const createCollection = (spec: CollectionApi): Result<Collection, ValueSchema.SchemaError<any>> => ValueSchema.asRaw<Collection>('collection', collectionSchema, spec);
