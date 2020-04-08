import { ValueSchema, FieldSchema } from '@ephox/boulder';
import { Result, Option, Fun } from '@ephox/katamari';

export interface BaseToolbarButtonApi<I extends BaseToolbarButtonInstanceApi> {
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

export interface ToolbarButtonApi extends BaseToolbarButtonApi<ToolbarButtonInstanceApi> {
  type?: 'button';
  onAction: (api: ToolbarButtonInstanceApi) => void;
}

// tslint:disable-next-line:no-empty-interface
export interface ToolbarButtonInstanceApi extends BaseToolbarButtonInstanceApi {

}

export interface BaseToolbarButton<I extends BaseToolbarButtonInstanceApi> {
  disabled: boolean;
  tooltip: Option<string>;
  icon: Option<string>;
  text: Option<string>;
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

export const toolbarButtonSchema = ValueSchema.objOf([
  FieldSchema.strictString('type'),
  FieldSchema.strictFunction('onAction')
].concat(baseToolbarButtonFields));

export const createToolbarButton = (spec: ToolbarButtonApi): Result<ToolbarButton, ValueSchema.SchemaError<any>> => ValueSchema.asRaw('toolbarbutton', toolbarButtonSchema, spec);
