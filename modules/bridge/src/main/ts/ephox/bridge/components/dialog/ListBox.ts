import { FieldProcessor, FieldSchema, StructureSchema, ValueType } from '@ephox/boulder';
import { Result } from '@ephox/katamari';

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
  disabled: boolean;
}

const listBoxSingleItemFields = [
  FieldSchema.requiredString('text'),
  FieldSchema.requiredString('value')
];

const listBoxNestedItemFields = [
  FieldSchema.requiredString('text'),
  FieldSchema.requiredArrayOf('items', StructureSchema.thunkOf('items', () => listBoxItemSchema))
];

const listBoxItemSchema = StructureSchema.oneOf([
  StructureSchema.objOf(listBoxSingleItemFields),
  StructureSchema.objOf(listBoxNestedItemFields)
]);

const listBoxFields: FieldProcessor[] = formComponentWithLabelFields.concat([
  FieldSchema.requiredArrayOf('items', listBoxItemSchema),
  FieldSchema.defaultedBoolean('disabled', false)
]);

export const listBoxSchema = StructureSchema.objOf(listBoxFields);

export const listBoxDataProcessor = ValueType.string;

export const createListBox = (spec: ListBoxSpec): Result<ListBox, StructureSchema.SchemaError<any>> =>
  StructureSchema.asRaw<ListBox>('listbox', listBoxSchema, spec);
