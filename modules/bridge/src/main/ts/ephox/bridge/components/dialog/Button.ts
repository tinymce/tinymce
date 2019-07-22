import { FieldPresence, FieldSchema, ValueSchema } from '@ephox/boulder';
import { Id, Result, Option } from '@ephox/katamari';

export interface ButtonApi {
  type: 'button';
  text: string;
  disabled?: boolean;
  primary?: boolean;
  name?: string;
  icon?: string;
  borderless?: boolean;
}

export interface Button {
  type: 'button';
  text: string;
  disabled: boolean;
  primary: boolean;
  name: string;
  icon: Option<string>;
  borderless: boolean;
}

const buttonFields = [
  FieldSchema.strictString('type'),
  FieldSchema.strictString('text'),
  FieldSchema.defaultedBoolean('disabled', false),
  FieldSchema.defaultedBoolean('primary', false),
  FieldSchema.field(
    'name',
    'name',
    FieldPresence.defaultedThunk(() => {
      return Id.generate('button-name');
    }),
    ValueSchema.string
  ),
  FieldSchema.optionString('icon'),
  FieldSchema.defaultedBoolean('borderless', false),
];

export const buttonSchema = ValueSchema.objOf(buttonFields);

export const createButton = (spec: ButtonApi): Result<Button, ValueSchema.SchemaError<any>> => {
  return ValueSchema.asRaw<Button>('button', buttonSchema, spec);
};
