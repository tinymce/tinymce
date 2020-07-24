import { FieldSchema, ValueSchema } from '@ephox/boulder';
import { Optional, Result } from '@ephox/katamari';

export interface SeparatorMenuItemApi {
  type?: 'separator';
  text?: string;
}

// tslint:disable-next-line:no-empty-interface
export interface SeparatorMenuItemInstanceApi { }

export interface SeparatorMenuItem {
  type: 'separator';
  text: Optional<string>;
}

export const separatorMenuItemSchema = ValueSchema.objOf([
  FieldSchema.strictString('type'),
  FieldSchema.optionString('text')
]);

export const createSeparatorMenuItem = (spec: SeparatorMenuItemApi): Result<SeparatorMenuItem, ValueSchema.SchemaError<any>> => ValueSchema.asRaw('separatormenuitem', separatorMenuItemSchema, spec);
