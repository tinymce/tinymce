import { FieldSchema, ValueSchema } from '@ephox/boulder';
import { Fun, Result } from '@ephox/katamari';

import { CommonMenuItem, CommonMenuItemApi, commonMenuItemFields, CommonMenuItemInstanceApi } from './CommonMenuItem';

export interface ToggleMenuItemApi extends CommonMenuItemApi {
  type?: 'togglemenuitem';
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
  active: boolean;
  onSetup: (api: ToggleMenuItemInstanceApi) => (api: ToggleMenuItemInstanceApi) => void;
  onAction: (api: ToggleMenuItemInstanceApi) => void;
}

export const toggleMenuItemSchema = ValueSchema.objOf([
  FieldSchema.strictString('type'),
  FieldSchema.defaultedBoolean('active', false),
  FieldSchema.defaultedFunction('onSetup', () => Fun.noop),
  FieldSchema.strictFunction('onAction')
].concat(commonMenuItemFields));

export const createToggleMenuItem = (spec: ToggleMenuItemApi): Result<ToggleMenuItem, ValueSchema.SchemaError<any>> => ValueSchema.asRaw('togglemenuitem', toggleMenuItemSchema, spec);
