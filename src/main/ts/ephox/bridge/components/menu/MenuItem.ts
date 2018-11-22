import { FieldSchema, Objects, ValueSchema } from '@ephox/boulder';
import { Fun, Result, Option } from '@ephox/katamari';
import { ToggleMenuItemApi, SeparatorMenuItemApi, FancyMenuItemApi } from '../../api/Menu';
import { CommonMenuItem, CommonMenuItemApi, commonMenuItemFields, CommonMenuItemInstanceApi } from './CommonMenuItem';

export type MenuItemContents = string | MenuItemApi | ToggleMenuItemApi | SeparatorMenuItemApi | FancyMenuItemApi;

// A menu item that allows individual actions and submenus
export interface MenuItemApi extends CommonMenuItemApi {
  type?: 'menuitem';
  icon?: string;
  getSubmenuItems?: () => string | Array<MenuItemContents>;
  onSetup?: (api: MenuItemInstanceApi) => (api: MenuItemInstanceApi) => void;
  onAction?: (api: MenuItemInstanceApi) => void;
}

// tslint:disable-next-line:no-empty-interface
export interface MenuItemInstanceApi extends CommonMenuItemInstanceApi { }

export interface MenuItem extends CommonMenuItem {
  type: 'menuitem';
  icon: Option<string>;
  hasSubmenu: boolean;
  onSetup: (api: MenuItemInstanceApi) => (api: MenuItemInstanceApi) => void;
  onAction: (api: MenuItemInstanceApi) => void;
}

export const menuItemSchema = ValueSchema.objOf([
  FieldSchema.strictString('type'),
  FieldSchema.state('hasSubmenu', (spec) => Objects.hasKey(spec, 'getSubmenuItems')),
  FieldSchema.defaultedFunction('onSetup', () => Fun.noop),
  FieldSchema.defaultedFunction('onAction', Fun.noop),
  FieldSchema.optionString('icon'),
].concat(commonMenuItemFields));

export const createMenuItem = (spec: MenuItemApi): Result<MenuItem, ValueSchema.SchemaError<any>> => {
  return ValueSchema.asRaw('menuitem', menuItemSchema, spec);
};
