import { FieldPresence, FieldSchema, ValueSchema } from '@ephox/boulder';
import { Id, Optional, Result } from '@ephox/katamari';
import { DialogToggleMenuItem, dialogToggleMenuItemSchema, DialogToggleMenuItemSpec } from './ToggleMenuItem';

export type DialogFooterMenuButtonItemSpec = DialogToggleMenuItemSpec;
export type DialogFooterToggleMenuItem = DialogToggleMenuItem;

// Note: This interface doesn't extend from a common button interface as this is only a configuration that specifies a button, but it's not by itself a button.
interface BaseDialogFooterButtonSpec {
  name?: string;
  align?: 'start' | 'end';
  primary?: boolean;
  disabled?: boolean;
  icon?: string;
}

export interface DialogFooterNormalButtonSpec extends BaseDialogFooterButtonSpec {
  type: 'submit' | 'cancel' | 'custom';
  text: string;
}

export interface DialogFooterMenuButtonSpec extends BaseDialogFooterButtonSpec {
  type: 'menu';
  text?: string;
  tooltip?: string;
  icon?: string;
  items: DialogFooterMenuButtonItemSpec[];
}

export type DialogFooterButtonSpec = DialogFooterNormalButtonSpec | DialogFooterMenuButtonSpec;

interface BaseDialogFooterButton {
  name: string;
  align: 'start' | 'end';
  primary: boolean;
  disabled: boolean;
  icon: Optional<string>;
}

export interface DialogFooterNormalButton extends BaseDialogFooterButton {
  type: 'submit' | 'cancel' | 'custom';
  text: string;
}

export interface DialogFooterMenuButton extends BaseDialogFooterButton {
  type: 'menu';
  text: Optional<string>;
  tooltip: Optional<string>;
  icon: Optional<string>;
  items: DialogFooterToggleMenuItem[];
}

export type DialogFooterButton = DialogFooterNormalButton | DialogFooterMenuButton;

const baseFooterButtonFields = [
  FieldSchema.field(
    'name',
    'name',
    FieldPresence.defaultedThunk(() => Id.generate('button-name')),
    ValueSchema.string
  ),
  FieldSchema.optionString('icon'),
  FieldSchema.defaultedStringEnum('align', 'end', [ 'start', 'end' ]),
  FieldSchema.defaultedBoolean('primary', false),
  FieldSchema.defaultedBoolean('disabled', false)
];

export const dialogFooterButtonFields = [
  ...baseFooterButtonFields,
  FieldSchema.strictString('text')
];

const normalFooterButtonFields = [
  FieldSchema.strictStringEnum('type', [ 'submit', 'cancel', 'custom' ]),
  ...dialogFooterButtonFields
];

const menuFooterButtonFields = [
  FieldSchema.strictStringEnum('type', [ 'menu' ]),
  FieldSchema.optionString('text'),
  FieldSchema.optionString('tooltip'),
  FieldSchema.optionString('icon'),
  FieldSchema.strictArrayOf('items', dialogToggleMenuItemSchema),
  ...baseFooterButtonFields
];

export const dialogFooterButtonSchema = ValueSchema.choose(
  'type',
  {
    submit: normalFooterButtonFields,
    cancel: normalFooterButtonFields,
    custom: normalFooterButtonFields,
    menu: menuFooterButtonFields
  }
);

export const createDialogFooterButton = (spec: DialogFooterButtonSpec): Result<DialogFooterButton, ValueSchema.SchemaError<any>> =>
  ValueSchema.asRaw<DialogFooterButton>('dialogfooterbutton', dialogFooterButtonSchema, spec);
