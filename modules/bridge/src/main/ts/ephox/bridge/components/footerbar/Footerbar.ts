import { HTMLElement } from '@ephox/dom-globals';
import { Fun, Option, Result } from '@ephox/katamari';
import { FieldSchema, ValueSchema } from '@ephox/boulder';

export interface FooterBarInstanceApi {
  element: () => HTMLElement;
}

export interface FooterBarApi {
  icon?: string;
  tooltip?: string;
  onShow?: (api: FooterBarInstanceApi) => void;
  onSetup?: (api: FooterBarInstanceApi) => (api: FooterBarInstanceApi) => void;
  onHide?: (api: FooterBarInstanceApi) => void;
}

export interface FooterBar {
  icon: Option<string>;
  tooltip: Option<string>;
  onShow: (api: FooterBarInstanceApi) => void;
  onSetup: (api: FooterBarInstanceApi) => (api: FooterBarInstanceApi) => void;
  onHide: (api: FooterBarInstanceApi) => void;
}

export const FooterBarSchema = ValueSchema.objOf([
  FieldSchema.optionString('icon'),
  FieldSchema.optionString('tooltip'),
  FieldSchema.defaultedFunction('onShow', Fun.noop),
  FieldSchema.defaultedFunction('onHide', Fun.noop),
  FieldSchema.defaultedFunction('onSetup', () => Fun.noop)
]);

export const createFooterBar = <T>(spec: FooterBarApi): Result<FooterBar, ValueSchema.SchemaError<any>> => {
  return ValueSchema.asRaw('FooterBar', FooterBarSchema, spec);
};
