import { FieldSchema, ValueSchema } from '@ephox/boulder';
import { Result } from '@ephox/katamari';

import { CommonMenuItem, CommonMenuItemApi, commonMenuItemFields } from '../menu/CommonMenuItem';

export interface DialogToggleMenuItemApi extends CommonMenuItemApi {
  type?: 'togglemenuitem';
  name: string;
}

export interface DialogToggleMenuItem extends CommonMenuItem {
  type: 'togglemenuitem';
  name: string;
}

export const dialogToggleMenuItemSchema = ValueSchema.objOf([
  FieldSchema.strictString('type'),
  FieldSchema.strictString('name')
].concat(commonMenuItemFields));

export const dialogToggleMenuItemDataProcessor = ValueSchema.boolean;

export const createToggleMenuItem = (spec: DialogToggleMenuItemApi): Result<DialogToggleMenuItem, ValueSchema.SchemaError<any>> => ValueSchema.asRaw('togglemenuitem', dialogToggleMenuItemSchema, spec);
