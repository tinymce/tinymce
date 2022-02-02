import { FieldSchema, StructureSchema } from '@ephox/boulder';
import { Fun, Optional, Result } from '@ephox/katamari';

import { FancyMenuItemSpec, MenuItemSpec, SeparatorMenuItemSpec, ToggleMenuItemSpec } from '../../api/Menu';
import { CommonMenuItem, CommonMenuItemSpec, commonMenuItemFields, CommonMenuItemInstanceApi } from './CommonMenuItem';

export type NestedMenuItemContents = string | MenuItemSpec | NestedMenuItemSpec | ToggleMenuItemSpec | SeparatorMenuItemSpec | FancyMenuItemSpec;

export interface NestedMenuItemSpec extends CommonMenuItemSpec {
  type?: 'nestedmenuitem';
  icon?: string;
  getSubmenuItems: () => string | Array<NestedMenuItemContents>;
  onSetup?: (api: NestedMenuItemInstanceApi) => (api: NestedMenuItemInstanceApi) => void;
}

// tslint:disable-next-line:no-empty-interface
export interface NestedMenuItemInstanceApi extends CommonMenuItemInstanceApi { }

export interface NestedMenuItem extends CommonMenuItem {
  type: 'nestedmenuitem';
  icon: Optional<string>;
  getSubmenuItems: () => string | Array<NestedMenuItemContents>;
  onSetup: (api: NestedMenuItemInstanceApi) => (api: NestedMenuItemInstanceApi) => void;
}

export const nestedMenuItemSchema = StructureSchema.objOf([
  FieldSchema.requiredString('type'),
  FieldSchema.requiredFunction('getSubmenuItems'),
  FieldSchema.defaultedFunction('onSetup', () => Fun.noop),
  FieldSchema.optionString('icon')
].concat(commonMenuItemFields));

export const createNestedMenuItem = (spec: NestedMenuItemSpec): Result<NestedMenuItem, StructureSchema.SchemaError<any>> =>
  StructureSchema.asRaw('nestedmenuitem', nestedMenuItemSchema, spec);
