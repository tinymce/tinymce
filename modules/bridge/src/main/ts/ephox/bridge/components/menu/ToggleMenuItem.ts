import { FieldSchema, StructureSchema } from '@ephox/boulder';
import { Fun, Optional, Result } from '@ephox/katamari';

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
  FieldSchema.requiredString('type'),
  FieldSchema.optionString('icon'),
  FieldSchema.defaultedBoolean('active', false),
  FieldSchema.defaultedFunction('onSetup', () => Fun.noop),
  FieldSchema.requiredFunction('onAction')
].concat(commonMenuItemFields));

export const createToggleMenuItem = (spec: ToggleMenuItemSpec): Result<ToggleMenuItem, StructureSchema.SchemaError<any>> =>
  StructureSchema.asRaw('togglemenuitem', toggleMenuItemSchema, spec);
