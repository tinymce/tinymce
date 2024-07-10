import { FieldSchema, StructureSchema, ValueType } from '@ephox/boulder';
import { Result } from '@ephox/katamari';

import * as ComponentSchema from '../../core/ComponentSchema';
import { ContextBar, contextBarFields, ContextBarSpec } from './ContextBar';

export interface GroupsLabels {
  name: string;
  items: Array<string>;
}

export interface ContextToolbarSpec extends ContextBarSpec {
  type?: 'contexttoolbar';
  groupsLabels?: Array<GroupsLabels>;
  items: string;
}

export interface ContextToolbar extends ContextBar {
  type: 'contexttoolbar';
  groupsLabels: Array<GroupsLabels>;
  items: string;
}

const groupsLabelsSchema = StructureSchema.objOf([
  FieldSchema.requiredString('name'),
  FieldSchema.requiredArrayOf('items', ValueType.string)
]);

const contextToolbarSchema = StructureSchema.objOf([
  ComponentSchema.defaultedType('contexttoolbar'),
  FieldSchema.requiredString('items'),
  FieldSchema.defaultedArrayOf('groupsLabels', [], groupsLabelsSchema)
].concat(contextBarFields));

export const createContextToolbar = (spec: ContextToolbarSpec): Result<ContextToolbar, StructureSchema.SchemaError<any>> =>
  StructureSchema.asRaw<ContextToolbar>('ContextToolbar', contextToolbarSchema, spec);
