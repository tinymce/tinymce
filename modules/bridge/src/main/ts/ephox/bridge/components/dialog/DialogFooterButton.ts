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
  /** @deprecated use `buttonType: "primary"` instead */
  primary?: boolean;
  enabled?: boolean;
  icon?: string;
  buttonType?: 'primary' | 'secondary';
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

export interface DialogFooterTogglableButtonSpec extends BaseDialogFooterButtonSpec {
  type: 'togglableButton';
  tooltip?: string;
  icon?: string;
  text?: string;
  active?: boolean;
}

export type DialogFooterButtonSpec = DialogFooterNormalButtonSpec | DialogFooterMenuButtonSpec | DialogFooterTogglableButtonSpec;

interface BaseDialogFooterButton {
  name: string;
  align: 'start' | 'end';
  /** @deprecated use `buttonType: "primary"` instead */
  primary: boolean;
  enabled: boolean;
  icon: Optional<string>;
  buttonType: Optional<'primary' | 'secondary'>;
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

export interface DialogFooterTogglableButton extends Omit<BaseDialogFooterButton, 'icon'> {
  type: 'togglableButton';
  tooltip: string;
  icon: string;
  text: Optional<string>;
  active: boolean;
}

export type DialogFooterButton = DialogFooterNormalButton | DialogFooterMenuButton | DialogFooterTogglableButton;

const baseFooterButtonFields = [
  ComponentSchema.generatedName('button'),
  ComponentSchema.optionalIcon,
  FieldSchema.defaultedStringEnum('align', 'end', [ 'start', 'end' ]),
  // this should be removed, but must live here because FieldSchema doesn't have a way to manage deprecated fields
  ComponentSchema.primary,
  ComponentSchema.enabled,
  // this should be defaulted to `secondary` but the implementation needs to manage the deprecation
  FieldSchema.optionStringEnum('buttonType', [ 'primary', 'secondary' ])
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

const togglableButtonSpecFields = [
  ...baseFooterButtonFields,
  FieldSchema.requiredStringEnum('type', [ 'togglableButton' ]),
  FieldSchema.requiredString('tooltip'),
  ComponentSchema.icon,
  ComponentSchema.optionalText,
  FieldSchema.defaultedBoolean('active', false)
];

export const dialogFooterButtonSchema = StructureSchema.choose(
  'type',
  {
    submit: normalFooterButtonFields,
    cancel: normalFooterButtonFields,
    custom: normalFooterButtonFields,
    menu: menuFooterButtonFields,
    togglableButton: togglableButtonSpecFields
  }
);

export const createDialogFooterButton = (spec: DialogFooterButtonSpec): Result<DialogFooterButton, StructureSchema.SchemaError<any>> =>
  StructureSchema.asRaw<DialogFooterButton>('dialogfooterbutton', dialogFooterButtonSchema, spec);
