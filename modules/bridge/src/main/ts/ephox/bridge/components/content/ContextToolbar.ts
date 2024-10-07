import { FieldSchema, StructureSchema, ValueType } from '@ephox/boulder';
import { Result } from '@ephox/katamari';

import * as ComponentSchema from '../../core/ComponentSchema';
import { ContextBar, contextBarFields, ContextBarSpec } from './ContextBar';

export interface ToolbarGroupSpec {
  name?: string;
  label?: string;
  items: string[];
}

export interface ContextToolbarSpec extends ContextBarSpec {
  type?: 'contexttoolbar';
  items: string | ToolbarGroupSpec[];
}

export interface ContextToolbar extends ContextBar {
  type: 'contexttoolbar';
  items: string | ToolbarGroupSpec[];
}

const contextToolbarSchema = StructureSchema.objOf([
  ComponentSchema.defaultedType('contexttoolbar'),
  FieldSchema.requiredOf('items', StructureSchema.oneOf([
    ValueType.string,
    StructureSchema.arrOfObj([
      FieldSchema.optionString('name'),
      FieldSchema.optionString('label'),
      FieldSchema.requiredArrayOf('items', ValueType.string)
    ])
  ])),
].concat(contextBarFields));

export const createContextToolbar = (spec: ContextToolbarSpec): Result<ContextToolbar, StructureSchema.SchemaError<any>> =>
  StructureSchema.asRaw<ContextToolbar>('ContextToolbar', contextToolbarSchema, spec);
