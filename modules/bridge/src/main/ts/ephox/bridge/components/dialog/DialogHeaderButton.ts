import { FieldSchema, StructureSchema } from '@ephox/boulder';
import { Optional } from '@ephox/katamari';

import * as ComponentSchema from '../../core/ComponentSchema';
import { DialogToggleMenuItem, DialogToggleMenuItemSpec } from './ToggleMenuItem';

export type DialogHeaderMenuButtonItem = DialogToggleMenuItem;
export type DialogHeaderMenuButtonItemSpec = DialogToggleMenuItemSpec;

type Align = 'start' | 'end';

type ButtonType = 'primary' | 'secondary';

interface BaseDialogHeaderButtonSpec {
  name?: string;
  align?: Align;
  /** @deprecated use `buttonType: "primary"` instead */
  primary?: boolean;
  enabled?: boolean;
  icon?: string;
  buttonType?: ButtonType;
  showIconAndText?: boolean;
}

export interface DialogHeaderNormalButtonSpec extends BaseDialogHeaderButtonSpec {
  type: 'submit' | 'cancel' | 'custom';
  text: string;
}

export interface DialogHeaderTogglableIconButtonSpec extends BaseDialogHeaderButtonSpec {
  type: 'customTogglableIcon';
  text?: string;
  tooltip?: string;
  icon: string;
  toggledIcon: string;
}

export interface DialogHeaderGroupButtonSpec {
  type: 'group';
  buttons: (DialogHeaderNormalButtonSpec | DialogHeaderTogglableIconButtonSpec)[];
}

export type DialogHeaderButtonSpec = DialogHeaderNormalButtonSpec | DialogHeaderTogglableIconButtonSpec | DialogHeaderGroupButtonSpec;

interface BaseDialogHeaderButton {
  name: string;
  align: 'start' | 'end';
  /** @deprecated use `buttonType: "primary"` instead */
  primary: boolean;
  enabled: boolean;
  buttonType: Optional<'primary' | 'secondary'>;
  showIconAndText: boolean;
}

export interface DialogHeaderNormalButton extends BaseDialogHeaderButton {
  type: 'submit' | 'cancel' | 'custom';
  text: string;
  icon: Optional<string>;
}

export interface DialogHeaderTogglableIconButton extends BaseDialogHeaderButton {
  type: 'customTogglableIcon';
  text?: string;
  tooltip?: string;
  icon: string;
  toggledIcon: string;
}

export interface DialogHeaderGroupButton {
  type: 'group';
  buttons: (DialogHeaderNormalButton | DialogHeaderTogglableIconButton)[];
}

export type DialogHeaderButton = DialogHeaderNormalButton | DialogHeaderTogglableIconButton | DialogHeaderGroupButton;

const baseHeaderButtonFields = [
  ComponentSchema.generatedName('button'),
  ComponentSchema.optionalIcon,
  FieldSchema.defaultedStringEnum('align', 'end', [ 'start', 'end' ] as Align[]),
  // this should be removed, but must live here because FieldSchema doesn't have a way to manage deprecated fields
  ComponentSchema.primary,
  ComponentSchema.enabled,
  FieldSchema.defaulted('showIconAndText', false),
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
  ...baseHeaderButtonFields,
  FieldSchema.requiredStringEnum('type', [ 'customTogglableIcon' ]),
  ComponentSchema.optionalText,
  ComponentSchema.optionalTooltip,
  ComponentSchema.icon,
  FieldSchema.requiredString('toggledIcon')
];

const schemaWithoutGroupButton = {
  submit: normalHeaderButtonFields,
  cancel: normalHeaderButtonFields,
  custom: normalHeaderButtonFields,
  customTogglableIcon: customTogglableIconHeaderButtonFields
};

const groupButtonFields = [
  FieldSchema.requiredStringEnum('type', [ 'group' ]),
  FieldSchema.defaultedArrayOf('buttons', [], StructureSchema.choose(
    'type',
    schemaWithoutGroupButton
  ))
];

export const dialogHeaderButtonSchema = StructureSchema.choose(
  'type',
  {
    ...schemaWithoutGroupButton,
    group: groupButtonFields
  }
);