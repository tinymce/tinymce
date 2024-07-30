import { StructureSchema } from '@ephox/boulder';
import { Optional, Result } from '@ephox/katamari';

import * as ComponentSchema from '../../core/ComponentSchema';

export interface BaseToolbarLabelSpec<I extends BaseToolbarLabelInstanceApi> {
  tooltip?: string;
  icon?: string;
  text?: string;
  onSetup?: (api: I) => (api: I) => void;
}

export interface BaseToolbarLabelInstanceApi {
  setText: (text: string) => void;
  setIcon: (icon: string) => void;
}

export interface ToolbarLabelSpec extends BaseToolbarLabelSpec<ToolbarLabelInstanceApi> {
  type?: 'label';
}

// tslint:disable-next-line:no-empty-interface
export interface ToolbarLabelInstanceApi extends BaseToolbarLabelInstanceApi {

}

export interface BaseToolbarLabel<I extends BaseToolbarLabelInstanceApi> {
  tooltip: Optional<string>;
  icon: Optional<string>;
  text: Optional<string>;
  onSetup: (api: I) => (api: I) => void;
}

export interface ToolbarLabel extends BaseToolbarLabel<ToolbarLabelInstanceApi> {
  type: 'label';
}

export const baseToolbarLabelFields = [
  ComponentSchema.optionalTooltip,
  ComponentSchema.optionalIcon,
  ComponentSchema.optionalText,
  ComponentSchema.onSetup
];

export const toolbarLabelSchema = StructureSchema.objOf([
  ComponentSchema.type
].concat(baseToolbarLabelFields));

export const createToolbarLabel = (spec: ToolbarLabelSpec): Result<ToolbarLabel, StructureSchema.SchemaError<any>> =>
  StructureSchema.asRaw('toolbarlavel', toolbarLabelSchema, spec);
