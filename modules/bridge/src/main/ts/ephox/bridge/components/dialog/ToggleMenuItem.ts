import { FieldSchema, ValueSchema } from '@ephox/boulder';
import { Result } from '@ephox/katamari';

import { CommonMenuItem, CommonMenuItemSpec, commonMenuItemFields } from '../menu/CommonMenuItem';

export interface DialogToggleMenuItemSpec extends CommonMenuItemSpec {
  type?: 'togglemenuitem';
  name: string;
}

export interface DialogToggleMenuItem extends CommonMenuItem {
  type: 'togglemenuitem';
  name: string;
}

export const dialogToggleMenuItemSchema = ValueSchema.objOf([
  FieldSchema.requiredString('type'),
  FieldSchema.requiredString('name')
].concat(commonMenuItemFields));

export const dialogToggleMenuItemDataProcessor = ValueSchema.boolean;

export const createToggleMenuItem = (spec: DialogToggleMenuItemSpec): Result<DialogToggleMenuItem, ValueSchema.SchemaError<any>> =>
  ValueSchema.asRaw('togglemenuitem', dialogToggleMenuItemSchema, spec);
