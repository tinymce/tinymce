import { FieldSchema, StructureSchema } from '@ephox/boulder';
import { Optional, Result } from '@ephox/katamari';

import * as ComponentSchema from '../../core/ComponentSchema';

interface ViewButtonApi {
  setIcon: (newIcon: string) => void;
}

interface ViewToggleButtonApi extends ViewButtonApi {
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

export interface ViewToggleButtonSpec extends BaseButtonSpec<ViewToggleButtonApi> {
  type: 'togglebutton';
  active?: boolean;
  onAction: (api: ViewToggleButtonApi) => void;
}

export interface ViewButtonsGroupSpec {
  type: 'group';
  buttons: Array<ViewNormalButtonSpec | ViewToggleButtonSpec>;
}

export type ViewButtonSpec = ViewNormalButtonSpec | ViewToggleButtonSpec | ViewButtonsGroupSpec;

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
  onAction: (api: ViewButtonApi) => void;
}

export interface ViewToggleButton extends BaseButton<ViewToggleButtonApi> {
  type: 'togglebutton';
  active: boolean;
  onAction: (api: ViewToggleButtonApi) => void;
}
export interface ViewButtonsGroup {
  type: 'group';
  buttons: Array<ViewNormalButton | ViewToggleButton>;
}

export type ViewButton = ViewNormalButton | ViewToggleButton | ViewButtonsGroup;

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

const toggleButtonFields = [
  ...baseButtonFields,
  FieldSchema.defaultedBoolean('active', false),
  FieldSchema.requiredStringEnum('type', [ 'togglebutton' ])
];

const schemaWithoutGroupButton = {
  button: normalButtonFields,
  togglebutton: toggleButtonFields,
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
