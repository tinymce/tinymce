import { FieldProcessorAdt, FieldSchema, ValueSchema } from '@ephox/boulder';
import { Result } from '@ephox/katamari';
import { FormComponentWithLabel, FormComponentWithLabelApi, formComponentWithLabelFields } from './FormComponent';

export interface ListBoxSingleItemApi {
  text: string;
  value: string;
}

export interface ListBoxNestedItemApi {
  text: string;
  items: ListBoxItemApi[];
}

export type ListBoxItemApi = ListBoxNestedItemApi | ListBoxSingleItemApi;

export interface ListBoxApi extends FormComponentWithLabelApi {
  type: 'listbox';
  items: ListBoxItemApi[];
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
  FieldSchema.strictString('text'),
  FieldSchema.strictString('value')
];

const listBoxNestedItemFields = [
  FieldSchema.strictString('text'),
  FieldSchema.strictArrayOf('items', ValueSchema.thunkOf('items', () => listBoxItemSchema))
];

const listBoxItemSchema = ValueSchema.oneOf([
  ValueSchema.objOf(listBoxSingleItemFields),
  ValueSchema.objOf(listBoxNestedItemFields)
]);

const listBoxFields: FieldProcessorAdt[] = formComponentWithLabelFields.concat([
  FieldSchema.strictArrayOf('items', listBoxItemSchema),
  FieldSchema.defaultedBoolean('disabled', false)
]);

export const listBoxSchema = ValueSchema.objOf(listBoxFields);

export const listBoxDataProcessor = ValueSchema.string;

export const createListBox = (spec: ListBoxApi): Result<ListBox, ValueSchema.SchemaError<any>> => {
  return ValueSchema.asRaw<ListBox>('listbox', listBoxSchema, spec);
};
