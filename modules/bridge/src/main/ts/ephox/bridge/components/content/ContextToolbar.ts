import { FieldSchema, StructureSchema } from '@ephox/boulder';
import { Result } from '@ephox/katamari';

import * as ComponentSchema from '../../core/ComponentSchema';
import { ContextBar, contextBarFields, ContextBarSpec } from './ContextBar';

export interface ContextToolbarSpec extends ContextBarSpec {
  type?: 'contexttoolbar';
  items: string;
}

export interface ContextToolbar extends ContextBar {
  type: 'contexttoolbar';
  items: string;
}

const contextToolbarSchema = StructureSchema.objOf([
  ComponentSchema.defaultedType('contexttoolbar'),
  FieldSchema.requiredString('items')
].concat(contextBarFields));

export const createContextToolbar = (spec: ContextToolbarSpec): Result<ContextToolbar, StructureSchema.SchemaError<any>> =>
  StructureSchema.asRaw<ContextToolbar>('ContextToolbar', contextToolbarSchema, spec);
