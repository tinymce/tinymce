import { FieldSchema, StructureSchema, ValueType } from '@ephox/boulder';
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

export const dialogToggleMenuItemSchema = StructureSchema.objOf([
  FieldSchema.requiredString('type'),
  FieldSchema.requiredString('name')
].concat(commonMenuItemFields));

export const dialogToggleMenuItemDataProcessor = ValueType.boolean;

export const createToggleMenuItem = (spec: DialogToggleMenuItemSpec): Result<DialogToggleMenuItem, StructureSchema.SchemaError<any>> =>
  StructureSchema.asRaw('togglemenuitem', dialogToggleMenuItemSchema, spec);
