import { StructureSchema } from '@ephox/boulder';
import { Optional, Result } from '@ephox/katamari';

import { FancyMenuItemSpec, MenuItemSpec, SeparatorMenuItemSpec, ToggleMenuItemSpec } from '../../api/Menu';
import * as ComponentSchema from '../../core/ComponentSchema';
import { CommonMenuItem, CommonMenuItemSpec, commonMenuItemFields, CommonMenuItemInstanceApi } from './CommonMenuItem';

export type NestedMenuItemContents = string | MenuItemSpec | NestedMenuItemSpec | ToggleMenuItemSpec | SeparatorMenuItemSpec | FancyMenuItemSpec;

export interface NestedMenuItemSpec extends CommonMenuItemSpec {
  type?: 'nestedmenuitem';
  icon?: string;
  getSubmenuItems: () => string | Array<NestedMenuItemContents>;
  onSetup?: (api: NestedMenuItemInstanceApi) => (api: NestedMenuItemInstanceApi) => void;
}

export interface NestedMenuItemInstanceApi extends CommonMenuItemInstanceApi {
  setTooltip: (tooltip: string) => void;
  setIconFill: (id: string, value: string) => void;
}

export interface NestedMenuItem extends CommonMenuItem {
  type: 'nestedmenuitem';
  icon: Optional<string>;
  getSubmenuItems: () => string | Array<NestedMenuItemContents>;
  onSetup: (api: NestedMenuItemInstanceApi) => (api: NestedMenuItemInstanceApi) => void;
}

export const nestedMenuItemSchema = StructureSchema.objOf([
  ComponentSchema.type,
  ComponentSchema.getSubmenuItems,
  ComponentSchema.onSetup,
  ComponentSchema.optionalIcon
].concat(commonMenuItemFields));

export const createNestedMenuItem = (spec: NestedMenuItemSpec): Result<NestedMenuItem, StructureSchema.SchemaError<any>> =>
  StructureSchema.asRaw('nestedmenuitem', nestedMenuItemSchema, spec);
