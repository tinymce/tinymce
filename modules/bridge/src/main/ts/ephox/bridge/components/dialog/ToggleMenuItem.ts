import { FieldSchema, ValueSchema, ValueType } from '@ephox/boulder';
import { Result } from '@ephox/katamari';
import { CommonMenuItem, commonMenuItemFields, CommonMenuItemSpec } from '../menu/CommonMenuItem';

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

export const dialogToggleMenuItemDataProcessor = ValueType.boolean;

export const createToggleMenuItem = (spec: DialogToggleMenuItemSpec): Result<DialogToggleMenuItem, ValueSchema.SchemaError<any>> =>
  ValueSchema.asRaw('togglemenuitem', dialogToggleMenuItemSchema, spec);
