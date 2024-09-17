import { FieldSchema, StructureSchema } from '@ephox/boulder';
import { Result, Type } from '@ephox/katamari';

import * as ComponentSchema from '../../core/ComponentSchema';
import { ContextBar, contextBarFields, ContextBarSpec } from './ContextBar';

export interface ToolbarGroup {
  title?: string;
  label?: string;
  items: string[];
}

export interface ContextToolbarSpec extends ContextBarSpec {
  type?: 'contexttoolbar';
  items: string | Array<ToolbarGroup>;
}

export interface ContextToolbar extends ContextBar {
  type: 'contexttoolbar';
  items: string | Array<ToolbarGroup>;
}

const contextToolbarSchema = StructureSchema.objOf([
  ComponentSchema.defaultedType('contexttoolbar'),
  // TODO: Probably better way of doing this
  FieldSchema.customField('items', (obj) => {
    const value = obj.items;
    if (Type.isString(value)) {
      return value;
    } else {
      return value as ToolbarGroup[]; // TODO Fix magic!
    }
  }),
  // FieldSchema.requiredString('items')
].concat(contextBarFields));

export const createContextToolbar = (spec: ContextToolbarSpec): Result<ContextToolbar, StructureSchema.SchemaError<any>> =>
  StructureSchema.asRaw<ContextToolbar>('ContextToolbar', contextToolbarSchema, spec);
