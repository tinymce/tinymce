import { StructureSchema } from '@ephox/boulder';
import { Optional, Result } from '@ephox/katamari';

import * as ComponentSchema from '../../core/ComponentSchema';
import { CommonMenuItem, CommonMenuItemSpec, commonMenuItemFields, CommonMenuItemInstanceApi } from './CommonMenuItem';

export interface ToggleMenuItemSpec extends CommonMenuItemSpec {
  type?: 'togglemenuitem';
  icon?: string;
  active?: boolean;
  onSetup?: (api: ToggleMenuItemInstanceApi) => void;
  onAction: (api: ToggleMenuItemInstanceApi) => void;
}

export interface ToggleMenuItemInstanceApi extends CommonMenuItemInstanceApi {
  isActive: () => boolean;
  setActive: (state: boolean) => void;
}

export interface ToggleMenuItem extends CommonMenuItem {
  type: 'togglemenuitem';
  icon: Optional<string>;
  active: boolean;
  onSetup: (api: ToggleMenuItemInstanceApi) => (api: ToggleMenuItemInstanceApi) => void;
  onAction: (api: ToggleMenuItemInstanceApi) => void;
}

export const toggleMenuItemSchema = StructureSchema.objOf([
  ComponentSchema.type,
  ComponentSchema.optionalIcon,
  ComponentSchema.active,
  ComponentSchema.onSetup,
  ComponentSchema.onAction
].concat(commonMenuItemFields));

export const createToggleMenuItem = (spec: ToggleMenuItemSpec): Result<ToggleMenuItem, StructureSchema.SchemaError<any>> =>
  StructureSchema.asRaw('togglemenuitem', toggleMenuItemSchema, spec);
