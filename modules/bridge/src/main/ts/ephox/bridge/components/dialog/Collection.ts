import { FieldProcessor, FieldSchema, StructureSchema } from '@ephox/boulder';
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

const collectionFields: FieldProcessor[] = formComponentWithLabelFields.concat([
  FieldSchema.defaulted('columns', 'auto')
]);

export const collectionSchema = StructureSchema.objOf(collectionFields);

// TODO: Make type for CollectionItem
export const collectionDataProcessor = StructureSchema.arrOfObj([
  FieldSchema.requiredString('value'),
  FieldSchema.requiredString('text'),
  FieldSchema.requiredString('icon')
]);

export const createCollection = (spec: CollectionSpec): Result<Collection, StructureSchema.SchemaError<any>> =>
  StructureSchema.asRaw<Collection>('collection', collectionSchema, spec);
