import { FieldProcessor, StructureSchema } from '@ephox/boulder';
import { Result } from '@ephox/katamari';

import * as ComponentSchema from '../../core/ComponentSchema';
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

export interface CollectionItem {
  value: string;
  text: string;
  icon: string;
}

const collectionFields: FieldProcessor[] = formComponentWithLabelFields.concat([
  ComponentSchema.defaultedColumns('auto')
]);

export const collectionSchema = StructureSchema.objOf(collectionFields);

// TODO: Make type for CollectionItem
export const collectionDataProcessor = StructureSchema.arrOfObj([
  ComponentSchema.value,
  ComponentSchema.text,
  ComponentSchema.icon
]);

export const createCollection = (spec: CollectionSpec): Result<Collection, StructureSchema.SchemaError<any>> =>
  StructureSchema.asRaw<Collection>('collection', collectionSchema, spec);
