import { FieldSchema, StructureSchema } from '@ephox/boulder';
import { Result } from '@ephox/katamari';

import * as ComponentSchema from '../../core/ComponentSchema';
import { BaseToolbarButton, BaseToolbarButtonInstanceApi, BaseToolbarButtonSpec } from '../toolbar/ToolbarButton';

interface BaseButtonSpec<Api extends BaseToolbarButtonInstanceApi> extends BaseToolbarButtonSpec<Api> {
  text: string;
  buttonType?: 'primary' | 'secondary';
}

export type TogglableIconButtonStatus = 'normal' | 'toggled';
interface BaseViewButtonInstanceApi extends BaseToolbarButtonInstanceApi {
}

export interface TogglableIconButtonApi extends BaseViewButtonInstanceApi {
  getStatus: () => TogglableIconButtonStatus;
  setStatus: (newStatus: TogglableIconButtonStatus) => void;
}

export interface ViewNormalButtonSpec extends BaseButtonSpec<BaseViewButtonInstanceApi> {
  type: 'button';
  onAction: () => void;
}

export interface ViewIconButtonSpec extends BaseButtonSpec<BaseViewButtonInstanceApi> {
  type: 'iconButton';
  icon: string;
  showIconAndText: boolean;
  onAction: () => void;
}

export interface ViewTogglableIconButtonSpec extends BaseButtonSpec<TogglableIconButtonApi> {
  name: string;
  type: 'togglableIconButton';
  icon: string;
  toggledIcon: string;
  initialStatus: TogglableIconButtonStatus;
  onAction: (api: TogglableIconButtonApi) => void;
}

export interface ViewButtonsGroupSpec {
  type: 'group';
  buttons: Array<ViewNormalButtonSpec | ViewIconButtonSpec | ViewTogglableIconButtonSpec>;
}

export type ViewButtonSpec = ViewNormalButtonSpec | ViewIconButtonSpec | ViewTogglableIconButtonSpec | ViewButtonsGroupSpec;

interface BaseButton<Api extends BaseToolbarButtonInstanceApi> extends Omit<BaseToolbarButton<Api>, 'text'> {
  text: string;
  buttonType: 'primary' | 'secondary';
}

export interface ViewNormalButton extends BaseButton<BaseViewButtonInstanceApi> {
  type: 'button';
  onAction: () => void;
}

export interface ViewIconButton extends Omit<BaseButton<BaseViewButtonInstanceApi>, 'icon'> {
  type: 'iconButton';
  icon: string;
  showIconAndText: boolean;
  onAction: () => void;
}

export interface ViewTogglableIconButton extends Omit<BaseButton<TogglableIconButtonApi>, 'icon'> {
  name: string;
  type: 'togglableIconButton';
  icon: string;
  toggledIcon: string;
  initialStatus: TogglableIconButtonStatus;
  onAction: (api: TogglableIconButtonApi) => void;
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
  FieldSchema.defaultedStringEnum('initialStatus', 'normal', [ 'normal', 'toggled' ]),
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
