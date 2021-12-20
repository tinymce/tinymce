import { FieldSchema, StructureSchema } from '@ephox/boulder';
import { Optional, Result } from '@ephox/katamari';

import * as ComponentSchema from '../../core/ComponentSchema';
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
  ComponentSchema.generatedName('button'),
  ComponentSchema.optionalIcon,
  FieldSchema.defaultedStringEnum('align', 'end', [ 'start', 'end' ]),
  ComponentSchema.primary,
  ComponentSchema.disabled
];

export const dialogFooterButtonFields = [
  ...baseFooterButtonFields,
  ComponentSchema.text
];

const normalFooterButtonFields = [
  FieldSchema.requiredStringEnum('type', [ 'submit', 'cancel', 'custom' ]),
  ...dialogFooterButtonFields
];

const menuFooterButtonFields = [
  FieldSchema.requiredStringEnum('type', [ 'menu' ]),
  ComponentSchema.optionalText,
  ComponentSchema.optionalTooltip,
  ComponentSchema.optionalIcon,
  FieldSchema.requiredArrayOf('items', dialogToggleMenuItemSchema),
  ...baseFooterButtonFields
];

export const dialogFooterButtonSchema = StructureSchema.choose(
  'type',
  {
    submit: normalFooterButtonFields,
    cancel: normalFooterButtonFields,
    custom: normalFooterButtonFields,
    menu: menuFooterButtonFields
  }
);

export const createDialogFooterButton = (spec: DialogFooterButtonSpec): Result<DialogFooterButton, StructureSchema.SchemaError<any>> =>
  StructureSchema.asRaw<DialogFooterButton>('dialogfooterbutton', dialogFooterButtonSchema, spec);
