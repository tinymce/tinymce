import { ValueSchema, FieldSchema } from '@ephox/boulder';
import { Result } from '@ephox/katamari';
import { BaseMenuButton, BaseMenuButtonSpec, baseMenuButtonFields, BaseMenuButtonInstanceApi, MenuButtonItemTypes } from '../../core/MenuButton';

export type ToolbarMenuButtonItemTypes = MenuButtonItemTypes;
export type SuccessCallback = (menu: string | ToolbarMenuButtonItemTypes[]) => void;

export interface ToolbarMenuButtonSpec extends BaseMenuButtonSpec {
  type?: 'menubutton';
  onSetup?: (api: ToolbarMenuButtonInstanceApi) => (api: ToolbarMenuButtonInstanceApi) => void;
}

export interface ToolbarMenuButton extends BaseMenuButton {
  type: 'menubutton';
  onSetup: (api: ToolbarMenuButtonInstanceApi) => (api: ToolbarMenuButtonInstanceApi) => void;
}

export interface ToolbarMenuButtonInstanceApi extends BaseMenuButtonInstanceApi { }

export const MenuButtonSchema = ValueSchema.objOf([
  FieldSchema.strictString('type'),
  ...baseMenuButtonFields
]);

export const isMenuButtonButton = (spec: any): spec is ToolbarMenuButton => spec.type === 'menubutton';

export const createMenuButton = (spec: ToolbarMenuButtonSpec): Result<ToolbarMenuButton, ValueSchema.SchemaError<any>> =>
  ValueSchema.asRaw<ToolbarMenuButton>('menubutton', MenuButtonSchema, spec);
