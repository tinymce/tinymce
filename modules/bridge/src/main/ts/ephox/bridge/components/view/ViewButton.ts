import { FieldSchema, StructureSchema } from '@ephox/boulder';
import { Optional, Result } from '@ephox/katamari';

import * as ComponentSchema from '../../core/ComponentSchema';

interface ViewButtonApi {
  setIcon: (newIcon: string) => void;
}

interface ViewTogglableButtonApi extends ViewButtonApi {
  isActive: () => boolean;
  setActive: (state: boolean) => void;
}

interface BaseButtonSpec<Api extends ViewButtonApi> {
  text?: string;
  icon?: string;
  tooltip?: string;
  buttonType?: 'primary' | 'secondary';
  borderless?: boolean;
  onAction: (api: Api) => void;
}

export interface ViewNormalButtonSpec extends BaseButtonSpec<ViewButtonApi> {
  text: string;
  type: 'button';
}

export interface ViewTogglableButtonSpec extends BaseButtonSpec<ViewTogglableButtonApi> {
  type: 'togglableButton';
  onAction: (api: ViewTogglableButtonApi) => void;
}

export interface ViewButtonsGroupSpec {
  type: 'group';
  buttons: Array<ViewNormalButtonSpec | ViewTogglableButtonSpec>;
}

export type ViewButtonSpec = ViewNormalButtonSpec | ViewTogglableButtonSpec | ViewButtonsGroupSpec;

interface BaseButton<Api extends ViewButtonApi> {
  text: Optional<string>;
  icon: Optional<string>;
  tooltip: Optional<string>;
  buttonType: 'primary' | 'secondary';
  borderless: boolean;
  onAction: (api: Api) => void;
}

export interface ViewNormalButton extends Omit<BaseButton<ViewButtonApi>, 'text'> {
  type: 'button';
  text: string;
  onAction: () => void;
}

export interface ViewTogglableButton extends BaseButton<ViewTogglableButtonApi> {
  type: 'togglableButton';
  onAction: (api: ViewTogglableButtonApi) => void;
}
export interface ViewButtonsGroup {
  type: 'group';
  buttons: Array<ViewNormalButton | ViewTogglableButton>;
}

export type ViewButton = ViewNormalButton | ViewTogglableButton | ViewButtonsGroup;

const baseButtonFields = [
  ComponentSchema.optionalText,
  ComponentSchema.optionalIcon,
  FieldSchema.optionString('tooltip'),
  FieldSchema.defaultedStringEnum('buttonType', 'secondary', [ 'primary', 'secondary' ]),
  FieldSchema.defaultedBoolean('borderless', false),
  FieldSchema.requiredFunction('onAction')
];

const normalButtonFields = [
  ...baseButtonFields,
  ComponentSchema.text,
  FieldSchema.requiredStringEnum('type', [ 'button' ]),
];

const togglableButtonFields = [
  ...baseButtonFields,
  FieldSchema.requiredStringEnum('type', [ 'togglableButton' ])
];

const schemaWithoutGroupButton = {
  button: normalButtonFields,
  togglableButton: togglableButtonFields,
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
