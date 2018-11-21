import { FieldSchema, ValueSchema } from '@ephox/boulder';
import { Fun, Result, Option } from '@ephox/katamari';
import { ToggleMenuItemApi, SeparatorMenuItemApi, FancyMenuItemApi, MenuItemApi } from '../../api/Menu';
import { CommonMenuItem, CommonMenuItemApi, commonMenuItemFields, CommonMenuItemInstanceApi } from './CommonMenuItem';

export type NestedMenuItemContents = string | MenuItemApi | NestedMenuItemApi | ToggleMenuItemApi | SeparatorMenuItemApi | FancyMenuItemApi;

export interface NestedMenuItemApi extends CommonMenuItemApi {
  type?: 'nestedmenuitem';
  icon?: string;
  getSubmenuItems: () => string | Array<NestedMenuItemContents>;
  onSetup?: (api: NestedMenuItemInstanceApi) => (api: NestedMenuItemInstanceApi) => void;
}

// tslint:disable-next-line:no-empty-interface
export interface NestedMenuItemInstanceApi extends CommonMenuItemInstanceApi { }

export interface NestedMenuItem extends CommonMenuItem {
  type: 'nestedmenuitem';
  icon: Option<string>;
  getSubmenuItems: () => string | Array<NestedMenuItemContents>;
  onSetup: (api: NestedMenuItemInstanceApi) => (api: NestedMenuItemInstanceApi) => void;
}

export const nestedMenuItemSchema = ValueSchema.objOf([
  FieldSchema.strictString('type'),
  FieldSchema.strictFunction('getSubmenuItems'),
  FieldSchema.defaultedFunction('onSetup', () => Fun.noop),
  FieldSchema.optionString('icon'),
].concat(commonMenuItemFields));

export const createNestedMenuItem = (spec: NestedMenuItemApi): Result<NestedMenuItem, ValueSchema.SchemaError<any>> => {
  return ValueSchema.asRaw('nestedmenuitem', nestedMenuItemSchema, spec);
};
