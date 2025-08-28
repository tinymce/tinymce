import { StructureSchema } from '@ephox/boulder';
import type { Optional, Result } from '@ephox/katamari';

import * as ComponentSchema from '../../core/ComponentSchema';

import { type CommonMenuItem, type CommonMenuItemSpec, commonMenuItemFields, type CommonMenuItemInstanceApi } from './CommonMenuItem';

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
  ComponentSchema.type,
  ComponentSchema.onSetup,
  ComponentSchema.defaultedOnAction,
  ComponentSchema.optionalIcon
].concat(commonMenuItemFields));

export const createMenuItem = (spec: MenuItemSpec): Result<MenuItem, StructureSchema.SchemaError<any>> =>
  StructureSchema.asRaw('menuitem', menuItemSchema, spec);
