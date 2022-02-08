import { FieldProcessor, FieldSchema, StructureSchema, ValueType } from '@ephox/boulder';
import { Result } from '@ephox/katamari';

import * as ComponentSchema from '../../core/ComponentSchema';
import { FormComponentWithLabel, formComponentWithLabelFields, FormComponentWithLabelSpec } from './FormComponent';

export interface ListBoxSingleItemSpec {
  text: string;
  value: string;
}

export interface ListBoxNestedItemSpec {
  text: string;
  items: ListBoxItemSpec[];
}

export type ListBoxItemSpec = ListBoxNestedItemSpec | ListBoxSingleItemSpec;

export interface ListBoxSpec extends FormComponentWithLabelSpec {
  type: 'listbox';
  items: ListBoxItemSpec[];
  disabled?: boolean;
}

interface ListBoxSingleItem {
  text: string;
  value: string;
}

interface ListBoxNestedItem {
  text: string;
  items: ListBoxItem[];
}

export type ListBoxItem = ListBoxNestedItem | ListBoxSingleItem;

export interface ListBox extends FormComponentWithLabel {
  type: 'listbox';
  items: ListBoxItem[];
  enabled: boolean;
}

const listBoxSingleItemFields = [
  ComponentSchema.text,
  ComponentSchema.value
];

const listBoxNestedItemFields = [
  ComponentSchema.text,
  FieldSchema.requiredArrayOf('items', StructureSchema.thunkOf('items', () => listBoxItemSchema))
];

const listBoxItemSchema = StructureSchema.oneOf([
  StructureSchema.objOf(listBoxSingleItemFields),
  StructureSchema.objOf(listBoxNestedItemFields)
]);

const listBoxFields: FieldProcessor[] = formComponentWithLabelFields.concat([
  FieldSchema.requiredArrayOf('items', listBoxItemSchema),
  ComponentSchema.enabled
]);

export const listBoxSchema = StructureSchema.objOf(listBoxFields);

export const listBoxDataProcessor = ValueType.string;

export const createListBox = (spec: ListBoxSpec): Result<ListBox, StructureSchema.SchemaError<any>> =>
  StructureSchema.asRaw<ListBox>('listbox', listBoxSchema, spec);
