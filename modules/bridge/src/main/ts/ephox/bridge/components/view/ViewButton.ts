import { FieldSchema, StructureSchema } from '@ephox/boulder';
import { Result } from '@ephox/katamari';

import * as ComponentSchema from '../../core/ComponentSchema';

interface BaseButtonSpec {
  text: string;
  buttonType?: 'primary' | 'secondary';
}

export type TogglableIconButtonStatus = 'normal' | 'toggled';

export interface ViewNormalButtonSpec extends BaseButtonSpec {
  type: 'button';
  onAction: () => void;
}

export interface ViewIconButtonSpec extends BaseButtonSpec {
  type: 'iconButton';
  icon: string;
  showIconAndText: boolean;
  onAction: () => void;
}

export interface ViewTogglableIconButtonSpec extends BaseButtonSpec {
  name: string;
  type: 'togglableIconButton';
  icon: string;
  toggledIcon: string;
  // TODO: this should return the API to allow caller to block the toggle if something goes wrong
  onAction: (api: TogglableIconButtonStatus) => void;
}

export interface ViewButtonsGroupSpec {
  type: 'group';
  buttons: Array<ViewNormalButtonSpec | ViewIconButtonSpec | ViewTogglableIconButtonSpec>;
}

export type ViewButtonSpec = ViewNormalButtonSpec | ViewIconButtonSpec | ViewTogglableIconButtonSpec | ViewButtonsGroupSpec;

interface BaseButton {
  text: string;
  buttonType: 'primary' | 'secondary';
}

export interface ViewNormalButton extends BaseButton {
  type: 'button';
  onAction: () => void;
}

export interface ViewIconButton extends BaseButton {
  type: 'iconButton';
  icon: string;
  showIconAndText: boolean;
  onAction: () => void;
}

export interface ViewTogglableIconButton extends BaseButton {
  name: string;
  type: 'togglableIconButton';
  icon: string;
  toggledIcon: string;
  onAction: (api: TogglableIconButtonStatus) => void;
}
export interface ViewButtonsGroup {
  type: 'group';
  buttons: Array<ViewNormalButton | ViewIconButton | ViewTogglableIconButton>;
}

export type ViewButton = ViewNormalButton | ViewIconButton | ViewTogglableIconButton | ViewButtonsGroup;

const normalButtonFields = [
  FieldSchema.requiredStringEnum('type', [ 'button' ]),
  ComponentSchema.text,
  FieldSchema.defaultedStringEnum('buttonType', 'secondary', [ 'primary', 'secondary' ]),
  FieldSchema.requiredFunction('onAction')
];

const iconButtonFields = [
  FieldSchema.requiredStringEnum('type', [ 'iconButton' ]),
  ComponentSchema.text,
  ComponentSchema.icon,
  FieldSchema.defaultedBoolean('showIconAndText', false),
  FieldSchema.defaultedStringEnum('buttonType', 'secondary', [ 'primary', 'secondary' ]),
  FieldSchema.requiredFunction('onAction')
];

const togglableIconButtonFields = [
  ComponentSchema.name,
  FieldSchema.requiredStringEnum('type', [ 'togglableIconButton' ]),
  ComponentSchema.text,
  ComponentSchema.icon,
  FieldSchema.required('toggledIcon'),
  FieldSchema.defaultedStringEnum('buttonType', 'secondary', [ 'primary', 'secondary' ]),
  FieldSchema.requiredFunction('onAction')
];

const schemaWithoutGroupButton = {
  button: normalButtonFields,
  iconButton: iconButtonFields,
  togglableIconButton: togglableIconButtonFields,
};

const groupFields = [
  FieldSchema.requiredStringEnum('type', [ 'group' ]),
  FieldSchema.defaultedArrayOf('buttons', [], StructureSchema.choose(
    'type',
    schemaWithoutGroupButton
  ))
];

export const viewButtonSchema = StructureSchema.choose(
  'type',
  {
    ...schemaWithoutGroupButton,
    group: groupFields
  }
);

export const createViewButton = (spec: ViewButtonSpec): Result<ViewButton, StructureSchema.SchemaError<any>> =>
  StructureSchema.asRaw<ViewButton>('viewbutton', viewButtonSchema, spec);
