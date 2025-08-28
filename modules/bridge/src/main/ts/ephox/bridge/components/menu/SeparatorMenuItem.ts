import { StructureSchema } from '@ephox/boulder';
import { Optional, Result } from '@ephox/katamari';

import * as ComponentSchema from '../../core/ComponentSchema';

export interface SeparatorMenuItemSpec {
  type?: 'separator';
  text?: string;
}

// tslint:disable-next-line:no-empty-interface
export interface SeparatorMenuItemInstanceApi { }

export interface SeparatorMenuItem {
  type: 'separator';
  text: Optional<string>;
}

export const separatorMenuItemSchema = StructureSchema.objOf([
  ComponentSchema.type,
  ComponentSchema.optionalText
]);

export const createSeparatorMenuItem = (spec: SeparatorMenuItemSpec): Result<SeparatorMenuItem, StructureSchema.SchemaError<any>> =>
  StructureSchema.asRaw('separatormenuitem', separatorMenuItemSchema, spec);
