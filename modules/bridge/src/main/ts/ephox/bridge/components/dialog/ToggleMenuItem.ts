import { StructureSchema, ValueType } from '@ephox/boulder';
import type { Result } from '@ephox/katamari';

import * as ComponentSchema from '../../core/ComponentSchema';
import { type CommonMenuItem, commonMenuItemFields, type CommonMenuItemSpec } from '../menu/CommonMenuItem';

export interface DialogToggleMenuItemSpec extends CommonMenuItemSpec {
  type?: 'togglemenuitem';
  name: string;
}

export interface DialogToggleMenuItem extends CommonMenuItem {
  type: 'togglemenuitem';
  name: string;
}

export const dialogToggleMenuItemSchema = StructureSchema.objOf([
  ComponentSchema.type,
  ComponentSchema.name
].concat(commonMenuItemFields));

export const dialogToggleMenuItemDataProcessor = ValueType.boolean;

export const createToggleMenuItem = (spec: DialogToggleMenuItemSpec): Result<DialogToggleMenuItem, StructureSchema.SchemaError<any>> =>
  StructureSchema.asRaw('togglemenuitem', dialogToggleMenuItemSchema, spec);
