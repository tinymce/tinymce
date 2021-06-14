import { FieldProcessor, FieldSchema, ValueSchema, ValueType } from '@ephox/boulder';
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
  FieldSchema.requiredArrayOf('items', ValueSchema.thunkOf('items', () => listBoxItemSchema))
];

const listBoxItemSchema = ValueSchema.oneOf([
  ValueSchema.objOf(listBoxSingleItemFields),
  ValueSchema.objOf(listBoxNestedItemFields)
]);

const listBoxFields: FieldProcessor[] = formComponentWithLabelFields.concat([
  FieldSchema.requiredArrayOf('items', listBoxItemSchema),
  FieldSchema.defaultedBoolean('disabled', false)
]);

export const listBoxSchema = ValueSchema.objOf(listBoxFields);

export const listBoxDataProcessor = ValueType.string;

export const createListBox = (spec: ListBoxSpec): Result<ListBox, ValueSchema.SchemaError<any>> =>
  ValueSchema.asRaw<ListBox>('listbox', listBoxSchema, spec);
