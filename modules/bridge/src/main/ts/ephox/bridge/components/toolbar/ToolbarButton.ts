import { FieldSchema, StructureSchema } from '@ephox/boulder';
import { Optional, Result } from '@ephox/katamari';

import * as ComponentSchema from '../../core/ComponentSchema';

export interface BaseToolbarButtonSpec<I extends BaseToolbarButtonInstanceApi> {
  enabled?: boolean;
  tooltip?: string;
  icon?: string;
  text?: string;
  onSetup?: (api: I) => (api: I) => void;
  context?: string;
}

export interface BaseToolbarButtonInstanceApi {
  isEnabled: () => boolean;
  setEnabled: (state: boolean) => void;
  setText: (text: string) => void;
  setIcon: (icon: string) => void;
}

export interface ToolbarButtonSpec extends BaseToolbarButtonSpec<ToolbarButtonInstanceApi> {
  type?: 'button';
  onAction: (api: ToolbarButtonInstanceApi) => void;
  shortcut?: string;
}

// tslint:disable-next-line:no-empty-interface
export interface ToolbarButtonInstanceApi extends BaseToolbarButtonInstanceApi {

}

export interface BaseToolbarButton<I extends BaseToolbarButtonInstanceApi> {
  enabled: boolean;
  tooltip: Optional<string>;
  icon: Optional<string>;
  text: Optional<string>;
  onSetup: (api: I) => (api: I) => void;
  context: string;
}

export interface ToolbarButton extends BaseToolbarButton<ToolbarButtonInstanceApi> {
  type: 'button';
  onAction: (api: ToolbarButtonInstanceApi) => void;
  shortcut: Optional<string>;
}

export const baseToolbarButtonFields = [
  ComponentSchema.enabled,
  ComponentSchema.optionalTooltip,
  ComponentSchema.optionalIcon,
  ComponentSchema.optionalText,
  ComponentSchema.onSetup,
  FieldSchema.defaultedString('context', 'mode:design')
];

export const toolbarButtonSchema = StructureSchema.objOf([
  ComponentSchema.type,
  ComponentSchema.onAction,
  ComponentSchema.optionalShortcut
].concat(baseToolbarButtonFields));

export const createToolbarButton = (spec: ToolbarButtonSpec): Result<ToolbarButton, StructureSchema.SchemaError<any>> =>
  StructureSchema.asRaw('toolbarbutton', toolbarButtonSchema, spec);
