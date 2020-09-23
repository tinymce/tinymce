import { FieldPresence, FieldSchema, ValueSchema } from '@ephox/boulder';
import { Id, Optional, Result } from '@ephox/katamari';

export interface ButtonSpec {
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
  icon: Optional<string>;
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
    FieldPresence.defaultedThunk(() => Id.generate('button-name')),
    ValueSchema.string
  ),
  FieldSchema.optionString('icon'),
  FieldSchema.defaultedBoolean('borderless', false)
];

export const buttonSchema = ValueSchema.objOf(buttonFields);

export const createButton = (spec: ButtonSpec): Result<Button, ValueSchema.SchemaError<any>> =>
  ValueSchema.asRaw<Button>('button', buttonSchema, spec);
