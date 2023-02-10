import { FieldSchema, StructureSchema } from '@ephox/boulder';
import { Optional, Result } from '@ephox/katamari';

import * as ComponentSchema from '../../core/ComponentSchema';

interface BaseButtonSpec {
  text?: string;
  tooltip?: string;
  buttonType?: 'primary' | 'secondary';
}

export interface TogglableButtonApi {
  isActive: () => boolean;
  setActive: (state: boolean) => void;
  setIcon: (newIcon: string) => void;
}

export interface ViewNormalButtonSpec extends BaseButtonSpec {
  type: 'button';
  onAction: () => void;
}

export interface ViewTogglableIconButtonSpec extends BaseButtonSpec {
  name: string;
  type: 'togglableIconButton';
  icon?: string;
  onAction: (api: TogglableButtonApi) => void;
}

export interface ViewButtonsGroupSpec {
  type: 'group';
  buttons: Array<ViewNormalButtonSpec | ViewTogglableIconButtonSpec>;
}

export type ViewButtonSpec = ViewNormalButtonSpec | ViewTogglableIconButtonSpec | ViewButtonsGroupSpec;

interface BaseButton {
  text: Optional<string>;
  tooltip: Optional<string>;
  buttonType: 'primary' | 'secondary';
}

export interface ViewNormalButton extends BaseButton {
  type: 'button';
  onAction: () => void;
}

export interface ViewTogglableIconButton extends BaseButton {
  name: string;
  type: 'togglableIconButton';
  icon: Optional<string>;
  onAction: (api: TogglableButtonApi) => void;
}
export interface ViewButtonsGroup {
  type: 'group';
  buttons: Array<ViewNormalButton | ViewTogglableIconButton>;
}

export type ViewButton = ViewNormalButton | ViewTogglableIconButton | ViewButtonsGroup;

const normalButtonFields = [
  FieldSchema.requiredStringEnum('type', [ 'button' ]),
  ComponentSchema.optionalText,
  FieldSchema.optionString('tooltip'),
  FieldSchema.defaultedStringEnum('buttonType', 'secondary', [ 'primary', 'secondary' ]),
  FieldSchema.requiredFunction('onAction')
];

const togglableIconButtonFields = [
  ComponentSchema.name,
  FieldSchema.requiredStringEnum('type', [ 'togglableIconButton' ]),
  ComponentSchema.optionalText,
  ComponentSchema.optionalIcon,
  FieldSchema.defaultedStringEnum('buttonType', 'secondary', [ 'primary', 'secondary' ]),
  FieldSchema.requiredFunction('onAction')
];

const schemaWithoutGroupButton = {
  button: normalButtonFields,
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
