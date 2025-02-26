import { FieldSchema, StructureSchema, ValueType } from '@ephox/boulder';
import { Arr, Optional, Result, Type } from '@ephox/katamari';

import * as ComponentSchema from '../../core/ComponentSchema';
import { baseToolbarButtonFields, BaseToolbarButtonInstanceApi, BaseToolbarButtonSpec } from '../toolbar/ToolbarButton';
import { ContextBar, contextBarFields, ContextBarSpec } from './ContextBar';

export interface ToolbarGroupSpec {
  name?: string;
  label?: string;
  items: string[];
}

export interface ContextToolbarLaunchButtonApi extends BaseToolbarButtonSpec<BaseToolbarButtonInstanceApi> {
  type?: 'contexttoolbarbutton';
}

export interface ContextToolbarSpec extends ContextBarSpec {
  type?: 'contexttoolbar';
  launch?: ContextToolbarLaunchButtonApi;
  items: string | ToolbarGroupSpec[];
}

export interface ToolbarGroup {
  name: Optional<string>;
  label: Optional<string>;
  items: string[];
}

export interface ContextToolbar extends ContextBar {
  type: 'contexttoolbar';
  launch: Optional<ContextToolbarLaunchButtonApi>;
  items: string | ToolbarGroup[];
}

const launchButtonFields = baseToolbarButtonFields.concat([
  ComponentSchema.defaultedType('contexttoolbarbutton')
]);

const contextToolbarSchema = StructureSchema.objOf([
  ComponentSchema.defaultedType('contexttoolbar'),
  FieldSchema.optionObjOf('launch', launchButtonFields),
  FieldSchema.requiredOf('items', StructureSchema.oneOf([
    ValueType.string,
    StructureSchema.arrOfObj([
      FieldSchema.optionString('name'),
      FieldSchema.optionString('label'),
      FieldSchema.requiredArrayOf('items', ValueType.string)
    ])
  ])),
].concat(contextBarFields));

const toolbarGroupBackToSpec = (toolbarGroup: ToolbarGroup): ToolbarGroupSpec => ({
  name: toolbarGroup.name.getOrUndefined(),
  label: toolbarGroup.label.getOrUndefined(),
  items: toolbarGroup.items
});

export const contextToolbarToSpec = (contextToolbar: ContextToolbar): ContextToolbarSpec => ({
  ...contextToolbar,
  launch: contextToolbar.launch.getOrUndefined(),
  items: Type.isString(contextToolbar.items) ? contextToolbar.items : Arr.map(contextToolbar.items, toolbarGroupBackToSpec)
});

export const createContextToolbar = (spec: ContextToolbarSpec): Result<ContextToolbar, StructureSchema.SchemaError<any>> =>
  StructureSchema.asRaw<ContextToolbar>('ContextToolbar', contextToolbarSchema, spec);
