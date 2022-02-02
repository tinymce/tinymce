import { FieldSchema, StructureSchema } from '@ephox/boulder';
import { Fun, Optional, Result } from '@ephox/katamari';

export interface BaseToolbarButtonSpec<I extends BaseToolbarButtonInstanceApi> {
  disabled?: boolean;
  tooltip?: string;
  icon?: string;
  text?: string;
  onSetup?: (api: I) => (api: I) => void;
}

export interface BaseToolbarButtonInstanceApi {
  isDisabled: () => boolean;
  setDisabled: (state: boolean) => void;
}

export interface ToolbarButtonSpec extends BaseToolbarButtonSpec<ToolbarButtonInstanceApi> {
  type?: 'button';
  onAction: (api: ToolbarButtonInstanceApi) => void;
}

// tslint:disable-next-line:no-empty-interface
export interface ToolbarButtonInstanceApi extends BaseToolbarButtonInstanceApi {

}

export interface BaseToolbarButton<I extends BaseToolbarButtonInstanceApi> {
  disabled: boolean;
  tooltip: Optional<string>;
  icon: Optional<string>;
  text: Optional<string>;
  onSetup: (api: I) => (api: I) => void;
}

export interface ToolbarButton extends BaseToolbarButton<ToolbarButtonInstanceApi> {
  type: 'button';
  onAction: (api: ToolbarButtonInstanceApi) => void;
}

export const baseToolbarButtonFields = [
  FieldSchema.defaultedBoolean('disabled', false),
  FieldSchema.optionString('tooltip'),
  FieldSchema.optionString('icon'),
  FieldSchema.optionString('text'),
  FieldSchema.defaultedFunction('onSetup', () => Fun.noop)
];

export const toolbarButtonSchema = StructureSchema.objOf([
  FieldSchema.requiredString('type'),
  FieldSchema.requiredFunction('onAction')
].concat(baseToolbarButtonFields));

export const createToolbarButton = (spec: ToolbarButtonSpec): Result<ToolbarButton, StructureSchema.SchemaError<any>> =>
  StructureSchema.asRaw('toolbarbutton', toolbarButtonSchema, spec);
