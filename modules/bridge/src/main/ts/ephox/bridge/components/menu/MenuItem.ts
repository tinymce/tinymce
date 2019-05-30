import { FieldSchema, ValueSchema } from '@ephox/boulder';
import { Fun, Result, Option } from '@ephox/katamari';
import { CommonMenuItem, CommonMenuItemApi, commonMenuItemFields, CommonMenuItemInstanceApi } from './CommonMenuItem';

export interface MenuItemApi extends CommonMenuItemApi {
  type?: 'menuitem';
  icon?: string;
  onSetup?: (api: MenuItemInstanceApi) => (api: MenuItemInstanceApi) => void;
  onAction?: (api: MenuItemInstanceApi) => void;
}

// tslint:disable-next-line:no-empty-interface
export interface MenuItemInstanceApi extends CommonMenuItemInstanceApi { }

export interface MenuItem extends CommonMenuItem {
  type: 'menuitem';
  icon: Option<string>;
  onSetup: (api: MenuItemInstanceApi) => (api: MenuItemInstanceApi) => void;
  onAction: (api: MenuItemInstanceApi) => void;
}

export const menuItemSchema = ValueSchema.objOf([
  FieldSchema.strictString('type'),
  FieldSchema.defaultedFunction('onSetup', () => Fun.noop),
  FieldSchema.defaultedFunction('onAction', Fun.noop),
  FieldSchema.optionString('icon'),
].concat(commonMenuItemFields));

export const createMenuItem = (spec: MenuItemApi): Result<MenuItem, ValueSchema.SchemaError<any>> => {
  return ValueSchema.asRaw('menuitem', menuItemSchema, spec);
};
