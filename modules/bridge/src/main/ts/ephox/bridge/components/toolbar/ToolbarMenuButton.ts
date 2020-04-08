import { ValueSchema, FieldSchema } from '@ephox/boulder';
import { Result } from '@ephox/katamari';
import { BaseMenuButton, BaseMenuButtonApi, baseMenuButtonFields, BaseMenuButtonInstanceApi, MenuButtonItemTypes } from '../../core/MenuButton';

export type ToolbarMenuButtonItemTypes = MenuButtonItemTypes;
export type SuccessCallback = (menu: string | ToolbarMenuButtonItemTypes[]) => void;

export interface ToolbarMenuButtonApi extends BaseMenuButtonApi {
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

export const createMenuButton = (spec: any): Result<ToolbarMenuButton, ValueSchema.SchemaError<any>> => ValueSchema.asRaw<ToolbarMenuButton>('menubutton', MenuButtonSchema, spec);
