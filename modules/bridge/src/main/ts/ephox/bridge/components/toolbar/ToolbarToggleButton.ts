import { StructureSchema } from '@ephox/boulder';
import { Result } from '@ephox/katamari';

import * as ComponentSchema from '../../core/ComponentSchema';
import { BaseToolbarButton, BaseToolbarButtonSpec, baseToolbarButtonFields, BaseToolbarButtonInstanceApi } from './ToolbarButton';

export interface BaseToolbarToggleButtonSpec<I extends BaseToolbarButtonInstanceApi> extends BaseToolbarButtonSpec<I> {
  active?: boolean;
}

export interface BaseToolbarToggleButton<I extends BaseToolbarButtonInstanceApi> extends BaseToolbarButton<I> {
  active: boolean;
}

export interface BaseToolbarToggleButtonInstanceApi extends BaseToolbarButtonInstanceApi {
  isActive: () => boolean;
  setActive: (state: boolean) => void;
}

export interface ToolbarToggleButtonSpec extends BaseToolbarToggleButtonSpec<ToolbarToggleButtonInstanceApi> {
  type?: 'togglebutton';
  onAction: (api: ToolbarToggleButtonInstanceApi) => void;
}

export interface ToolbarToggleButton extends BaseToolbarToggleButton<ToolbarToggleButtonInstanceApi> {
  type: 'togglebutton';
  onAction: (api: ToolbarToggleButtonInstanceApi) => void;
}

// tslint:disable-next-line:no-empty-interface
export interface ToolbarToggleButtonInstanceApi extends BaseToolbarToggleButtonInstanceApi {

}

export const baseToolbarToggleButtonFields = [
  ComponentSchema.active
].concat(baseToolbarButtonFields);

export const toggleButtonSchema = StructureSchema.objOf(
  baseToolbarToggleButtonFields.concat([
    ComponentSchema.type,
    ComponentSchema.onAction
  ])
);

export const isToggleButton = (spec: any): spec is ToolbarToggleButton => spec.type === 'togglebutton';

export const createToggleButton = (spec: ToolbarToggleButtonSpec): Result<ToolbarToggleButton, StructureSchema.SchemaError<any>> =>
  StructureSchema.asRaw<ToolbarToggleButton>('ToggleButton', toggleButtonSchema, spec);
