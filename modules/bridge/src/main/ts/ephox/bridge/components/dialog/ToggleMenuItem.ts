import { FieldSchema, ValueSchema } from '@ephox/boulder';
import { Fun, Result } from '@ephox/katamari';

import { CommonMenuItem, CommonMenuItemApi, commonMenuItemFields, CommonMenuItemInstanceApi } from '../menu/CommonMenuItem';

export interface DialogToggleMenuItemApi extends CommonMenuItemApi {
  type?: 'togglemenuitem';
  name: string;
  active?: boolean;
  onSetup?: (api: DialogToggleMenuItemInstanceApi) => void;
}

export interface DialogToggleMenuItemInstanceApi extends CommonMenuItemInstanceApi {
  isActive: () => boolean;
  setActive: (state: boolean) => void;
}

export interface DialogToggleMenuItem extends CommonMenuItem {
  type: 'togglemenuitem';
  name: string;
  active: boolean;
  onSetup: (api: DialogToggleMenuItemInstanceApi) => (api: DialogToggleMenuItemInstanceApi) => void;
}

export const dialogToggleMenuItemSchema = ValueSchema.objOf([
  FieldSchema.strictString('type'),
  FieldSchema.strictString('name'),
  FieldSchema.defaultedBoolean('active', false),
  FieldSchema.defaultedFunction('onSetup', () => Fun.noop)
].concat(commonMenuItemFields));

export const dialogToggleMenuItemDataProcessor = ValueSchema.boolean;

export const createToggleMenuItem = (spec: DialogToggleMenuItemApi): Result<DialogToggleMenuItem, ValueSchema.SchemaError<any>> => {
  return ValueSchema.asRaw('togglemenuitem', dialogToggleMenuItemSchema, spec);
};
