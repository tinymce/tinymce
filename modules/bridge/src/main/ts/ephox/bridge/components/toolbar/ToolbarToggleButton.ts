import { ValueSchema, FieldSchema, Processor } from '@ephox/boulder';
import { Result } from '@ephox/katamari';
import { BaseToolbarButtonApi, BaseToolbarButtonInstanceApi, BaseToolbarButton, baseToolbarButtonFields } from './ToolbarButton';

export interface BaseToolbarToggleButtonApi<I extends BaseToolbarButtonInstanceApi> extends BaseToolbarButtonApi<I> {
  active?: boolean;
}

export interface BaseToolbarToggleButton<I extends BaseToolbarButtonInstanceApi> extends BaseToolbarButton<I> {
  active: boolean;
}

export interface BaseToolbarToggleButtonInstanceApi extends BaseToolbarButtonInstanceApi {
  isActive: () => boolean;
  setActive: (state: boolean) => void;
}

export interface ToolbarToggleButtonApi extends BaseToolbarToggleButtonApi<ToolbarToggleButtonInstanceApi> {
  type?: 'togglebutton';
  onAction: (api: ToolbarToggleButtonInstanceApi) => void;
}

export interface ToolbarToggleButton extends BaseToolbarToggleButton<ToolbarToggleButtonInstanceApi>  {
  type: 'togglebutton';
  onAction: (api: ToolbarToggleButtonInstanceApi) => void;
}

// tslint:disable-next-line:no-empty-interface
export interface ToolbarToggleButtonInstanceApi extends BaseToolbarToggleButtonInstanceApi {

}

export const baseToolbarToggleButtonFields = [
  FieldSchema.defaultedBoolean('active', false),
].concat(baseToolbarButtonFields);

export const toggleButtonSchema = ValueSchema.objOf(
  baseToolbarToggleButtonFields.concat([
    FieldSchema.strictString('type'),
    FieldSchema.strictFunction('onAction')
  ])
) as Processor;

export const isToggleButton = (spec: any): spec is ToolbarToggleButton => spec.type === 'togglebutton';

export const createToggleButton = (spec: any): Result<ToolbarToggleButton, ValueSchema.SchemaError<any>> => {
  return ValueSchema.asRaw<ToolbarToggleButton>('ToggleButton', toggleButtonSchema, spec);
};
