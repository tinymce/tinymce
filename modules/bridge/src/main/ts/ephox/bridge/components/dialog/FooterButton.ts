import { FieldPresence, FieldSchema, ValueSchema } from '@ephox/boulder';
import { Id, Option } from '@ephox/katamari';
import { DialogToggleMenuItemApi, dialogToggleMenuItemSchema, DialogToggleMenuItem as DialogToggleMenuItemType } from './ToggleMenuItem';

export type DialogMenuButtonItemTypes = DialogToggleMenuItemApi;
export type DialogToggleMenuItem = DialogToggleMenuItemType;

// Note: This interface doesn't extend from a common button interface as this is only a configuration that specifies a button, but it's not by itself a button.
interface BaseDialogButtonApi {
  name?: string;
  align?: 'start' | 'end';
  primary?: boolean;
  disabled?: boolean;
  icon?: string;
}

export interface DialogNormalButtonApi extends BaseDialogButtonApi {
  type: 'submit' | 'cancel' | 'custom';
  text: string;
}

export interface DialogMenuButtonApi extends BaseDialogButtonApi {
  type: 'menu';
  text?: string;
  tooltip?: string;
  icon?: string;
  items: DialogMenuButtonItemTypes[];
}

export type DialogButtonApi = DialogNormalButtonApi | DialogMenuButtonApi;

interface BaseDialogButton {
  name: string;
  align: 'start' | 'end';
  primary: boolean;
  disabled: boolean;
  icon: Option<string>;
}

export interface DialogNormalButton extends BaseDialogButton {
  type: 'submit' | 'cancel' | 'custom';
  text: string;
}

export interface DialogMenuButton extends BaseDialogButton {
  type: 'menu';
  text: Option<string>;
  tooltip: Option<string>;
  icon: Option<string>;
  items: DialogToggleMenuItem[];
}

export type DialogButton = DialogNormalButton | DialogMenuButton;

const baseButtonFields = [
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

export const dialogButtonFields = [
  ...baseButtonFields,
  FieldSchema.strictString('text')
];

const normalButtonFields = [
  FieldSchema.strictStringEnum('type', [ 'submit', 'cancel', 'custom' ]),
  ...dialogButtonFields
];

const menuButtonFields = [
  FieldSchema.strictStringEnum('type', [ 'menu' ]),
  FieldSchema.optionString('text'),
  FieldSchema.optionString('tooltip'),
  FieldSchema.optionString('icon'),
  FieldSchema.strictArrayOf('items', dialogToggleMenuItemSchema),
  ...baseButtonFields
];

export const dialogButtonSchema = ValueSchema.choose(
  'type',
  {
    submit: normalButtonFields,
    cancel: normalButtonFields,
    custom: normalButtonFields,
    menu: menuButtonFields
  }
);
