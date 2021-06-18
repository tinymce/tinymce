import { FieldSchema, StructureSchema } from '@ephox/boulder';
import { Fun, Optional, Result } from '@ephox/katamari';

import { CommonMenuItem, CommonMenuItemSpec, commonMenuItemFields, CommonMenuItemInstanceApi } from './CommonMenuItem';

export interface MenuItemSpec extends CommonMenuItemSpec {
  type?: 'menuitem';
  icon?: string;
  onSetup?: (api: MenuItemInstanceApi) => (api: MenuItemInstanceApi) => void;
  onAction?: (api: MenuItemInstanceApi) => void;
}

// tslint:disable-next-line:no-empty-interface
export interface MenuItemInstanceApi extends CommonMenuItemInstanceApi { }

export interface MenuItem extends CommonMenuItem {
  type: 'menuitem';
  icon: Optional<string>;
  onSetup: (api: MenuItemInstanceApi) => (api: MenuItemInstanceApi) => void;
  onAction: (api: MenuItemInstanceApi) => void;
}

export const menuItemSchema = StructureSchema.objOf([
  FieldSchema.requiredString('type'),
  FieldSchema.defaultedFunction('onSetup', () => Fun.noop),
  FieldSchema.defaultedFunction('onAction', Fun.noop),
  FieldSchema.optionString('icon')
].concat(commonMenuItemFields));

export const createMenuItem = (spec: MenuItemSpec): Result<MenuItem, StructureSchema.SchemaError<any>> =>
  StructureSchema.asRaw('menuitem', menuItemSchema, spec);
