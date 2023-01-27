import { FieldSchema, StructureSchema } from '@ephox/boulder';
import { Optional } from '@ephox/katamari';

import * as ComponentSchema from '../../core/ComponentSchema';
import { DialogToggleMenuItem, DialogToggleMenuItemSpec } from './ToggleMenuItem';

export type DialogHeaderMenuButtonItem = DialogToggleMenuItem;
export type DialogHeaderMenuButtonItemSpec = DialogToggleMenuItemSpec;

type Align = 'start' | 'end';

type ButtonType = 'primary' | 'secondary';

interface BaseDialogHeaderButton {
  name: string;
  align: Align;
  /** @deprecated use `buttonType: "primary"` instead */
  primary: boolean;
  enabled: boolean;
  icon: string;
  buttonType: Optional<ButtonType>;
}

export interface DialogHeaderNormalButtonSpec extends BaseDialogHeaderButton {
  type: 'submit' | 'cancel' | 'custom';
  text: string;
}

export interface DialogHeaderTogglableIconButton extends BaseDialogHeaderButton {
  type: 'customTogglableIcon';
  text: Optional<string>;
  tooltip: Optional<string>;
  icon: string;
  toggledIcon: string;
  items: DialogHeaderMenuButtonItem[];
}

interface BaseDialogHeaderButtonSpec {
  name?: string;
  align?: Align;
  /** @deprecated use `buttonType: "primary"` instead */
  primary?: boolean;
  enabled?: boolean;
  icon?: string;
  buttonType?: ButtonType;
}

export interface DialogHeaderNormalButton extends BaseDialogHeaderButtonSpec {
  type: 'submit' | 'cancel' | 'custom';
  text: string;
}

export interface DialogHeaderTogglableIconButtonSpec extends BaseDialogHeaderButtonSpec {
  type: 'customTogglableIcon';
  text?: string;
  tooltip?: string;
  icon: string;
  toggledIcon: string;
  items?: DialogHeaderMenuButtonItemSpec[];
}

export type DialogHeaderButton = DialogHeaderNormalButton | DialogHeaderTogglableIconButton;
export type DialogHeaderButtonSpec = DialogHeaderNormalButtonSpec | DialogHeaderTogglableIconButtonSpec;

const baseHeaderButtonFields = [
  ComponentSchema.generatedName('button'),
  ComponentSchema.icon,
  FieldSchema.defaultedStringEnum('align', 'end', [ 'start', 'end' ] as Align[]),
  // this should be removed, but must live here because FieldSchema doesn't have a way to manage deprecated fields
  ComponentSchema.primary,
  ComponentSchema.enabled,
  // this should be defaulted to `secondary` but the implementation needs to manage the deprecation
  FieldSchema.optionStringEnum('buttonType', [ 'primary', 'secondary' ] as ButtonType[])
];

export const dialogFooterButtonFields = [
  ...baseHeaderButtonFields,
  ComponentSchema.text
];

const normalHeaderButtonFields = [
  FieldSchema.requiredStringEnum('type', [ 'submit', 'cancel', 'custom' ]),
  ...dialogFooterButtonFields
];

const customTogglableIconHeaderButtonFields = [
  FieldSchema.requiredStringEnum('type', [ 'customTogglableIcon' ]),
  ComponentSchema.optionalText,
  ComponentSchema.optionalTooltip,
  ComponentSchema.icon,
  ...baseHeaderButtonFields
];

export const dialogHeaderButtonSchema = StructureSchema.choose(
  'type',
  {
    submit: normalHeaderButtonFields,
    cancel: normalHeaderButtonFields,
    custom: normalHeaderButtonFields,
    customTogglableIcon: customTogglableIconHeaderButtonFields
  }
);