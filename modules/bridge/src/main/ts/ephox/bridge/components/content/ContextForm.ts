import { FieldSchema, StructureSchema } from '@ephox/boulder';
import { Fun, Optional, Result } from '@ephox/katamari';

import * as ComponentSchema from '../../core/ComponentSchema';
import { BaseToolbarButton, baseToolbarButtonFields, BaseToolbarButtonInstanceApi, BaseToolbarButtonSpec } from '../toolbar/ToolbarButton';
import {
  BaseToolbarToggleButton, baseToolbarToggleButtonFields, BaseToolbarToggleButtonInstanceApi, BaseToolbarToggleButtonSpec
} from '../toolbar/ToolbarToggleButton';
import { ContextBar, contextBarFields, ContextBarSpec } from './ContextBar';

export interface ContextFormLaunchButtonApi extends BaseToolbarButtonSpec<BaseToolbarButtonInstanceApi> {
  type: 'contextformbutton';
}

export interface ContextFormLaunchButton extends BaseToolbarButton<BaseToolbarButtonInstanceApi> {
  type: 'contextformbutton';
}

export interface ContextFormLaunchToggleButtonSpec extends BaseToolbarToggleButtonSpec<BaseToolbarToggleButtonInstanceApi> {
  type: 'contextformtogglebutton';
}

export interface ContextFormLaunchToggleButton extends BaseToolbarToggleButton<BaseToolbarToggleButtonInstanceApi> {
  type: 'contextformtogglebutton';
}

// tslint:disable-next-line:no-empty-interface
export interface ContextFormButtonInstanceApi extends BaseToolbarButtonInstanceApi {

}

// tslint:disable-next-line:no-empty-interface
export interface ContextFormToggleButtonInstanceApi extends BaseToolbarToggleButtonInstanceApi {

}

export interface ContextFormButtonSpec<T> extends BaseToolbarButtonSpec<ContextFormButtonInstanceApi> {
  type?: 'contextformbutton';
  primary?: boolean;
  align?: 'start' | 'end';
  onAction: (formApi: ContextFormInstanceApi<T>, api: ContextFormButtonInstanceApi) => void;
}

export interface ContextFormToggleButtonSpec<T> extends BaseToolbarToggleButtonSpec<ContextFormToggleButtonInstanceApi> {
  type?: 'contextformtogglebutton';
  primary?: boolean;
  align?: 'start' | 'end';
  onAction: (formApi: ContextFormInstanceApi<T>, buttonApi: ContextFormToggleButtonInstanceApi) => void;
}

export interface ContextFormButton<T> extends BaseToolbarButton<ContextFormButtonInstanceApi> {
  type?: 'contextformbutton';
  primary?: boolean;
  align?: 'start' | 'end';
  onAction: (formApi: ContextFormInstanceApi<T>, buttonApi: ContextFormButtonInstanceApi) => void;
  original: ContextFormButtonSpec<T>;
}

export interface ContextFormToggleButton<T> extends BaseToolbarToggleButton<ContextFormToggleButtonInstanceApi> {
  type?: 'contextformtogglebutton';
  primary?: boolean;
  align?: 'start' | 'end';
  onAction: (formApi: ContextFormInstanceApi<T>, buttonApi: ContextFormToggleButtonInstanceApi) => void;
  original: ContextFormToggleButtonSpec<T>;
}

export interface ContextFormInstanceApi<T> {
  setInputEnabled: (state: boolean) => void;
  isInputEnabled: () => boolean;
  hide: () => void;
  back: () => void;
  getValue: () => T;
  setValue: (value: T) => void;
}

export interface SizeData {
  width: string;
  height: string;
}

export interface BaseContextFormSpec<T> extends ContextBarSpec {
  initValue?: () => T;
  label?: string;
  launch?: ContextFormLaunchButtonApi | ContextFormLaunchToggleButtonSpec;
  commands: Array<ContextFormToggleButtonSpec<T> | ContextFormButtonSpec<T>>;
  onInput?: (api: ContextFormInstanceApi<T>) => void;
  onSetup?: (api: ContextFormInstanceApi<T>) => (api: ContextFormInstanceApi<T>) => void;
}

export interface ContextInputFormSpec extends BaseContextFormSpec<string> {
  type?: 'contextform';
  placeholder?: string;
}

export interface ContextSliderFormSpec extends BaseContextFormSpec<number> {
  type: 'contextsliderform';
  min?: () => number;
  max?: () => number;
}

export interface ContextSizeInputFormSpec extends BaseContextFormSpec<SizeData> {
  type: 'contextsizeinputform';
}

export type ContextFormSpec = ContextInputFormSpec | ContextSliderFormSpec | ContextSizeInputFormSpec;

export type ContextFormCommand<T> = ContextFormButton<T> | ContextFormToggleButton<T>;

export interface BaseContextForm<T> extends ContextBar {
  initValue: () => T;
  label: Optional<string>;
  launch: Optional<ContextFormLaunchButton | ContextFormLaunchToggleButton>;
  commands: ContextFormCommand<T>[];
  onInput: (api: ContextFormInstanceApi<T>) => void;
  onSetup: (api: ContextFormInstanceApi<T>) => (api: ContextFormInstanceApi<T>) => void;
}

export interface ContextInputForm extends BaseContextForm<string> {
  type: 'contextform';
  placeholder: Optional<string>;
}

export interface ContextSliderForm extends BaseContextForm<number> {
  type: 'contextsliderform';
  min: () => number;
  max: () => number;
}

export interface ContextSizeInputForm extends BaseContextForm<SizeData> {
  type: 'contextsizeinputform';
}

export type ContextForm = ContextInputForm | ContextSliderForm | ContextSizeInputForm;

const contextButtonFields = baseToolbarButtonFields.concat([
  ComponentSchema.defaultedType('contextformbutton'),
  FieldSchema.defaultedString('align', 'end'),
  ComponentSchema.primary,
  ComponentSchema.onAction,
  FieldSchema.customField('original', Fun.identity)
]);

const contextToggleButtonFields = baseToolbarToggleButtonFields.concat([
  ComponentSchema.defaultedType('contextformbutton'),
  FieldSchema.defaultedString('align', 'end'),
  ComponentSchema.primary,
  ComponentSchema.onAction,
  FieldSchema.customField('original', Fun.identity)
]);

const launchButtonFields = baseToolbarButtonFields.concat([
  ComponentSchema.defaultedType('contextformbutton')
]);

const launchToggleButtonFields = baseToolbarToggleButtonFields.concat([
  ComponentSchema.defaultedType('contextformtogglebutton')
]);

const toggleOrNormal = StructureSchema.choose('type', {
  contextformbutton: contextButtonFields,
  contextformtogglebutton: contextToggleButtonFields
});

const baseContextFormFields = [
  ComponentSchema.optionalLabel,
  FieldSchema.requiredArrayOf('commands', toggleOrNormal),
  FieldSchema.optionOf('launch', StructureSchema.choose('type', {
    contextformbutton: launchButtonFields,
    contextformtogglebutton: launchToggleButtonFields
  })),
  FieldSchema.defaultedFunction('onInput', Fun.noop),
  FieldSchema.defaultedFunction('onSetup', Fun.noop)
];

const contextFormFields = [
  ...contextBarFields,
  ...baseContextFormFields,
  FieldSchema.requiredStringEnum('type', [ 'contextform' ]),
  FieldSchema.defaultedFunction('initValue', Fun.constant('')),
  FieldSchema.optionString('placeholder'),
];

const contextSliderFormFields = [
  ...contextBarFields,
  ...baseContextFormFields,
  FieldSchema.requiredStringEnum('type', [ 'contextsliderform' ]),
  FieldSchema.defaultedFunction('initValue', Fun.constant(0)),
  FieldSchema.defaultedFunction('min', Fun.constant(0)),
  FieldSchema.defaultedFunction('max', Fun.constant(100))
];

const contextSizeInputFormFields = [
  ...contextBarFields,
  ...baseContextFormFields,
  FieldSchema.requiredStringEnum('type', [ 'contextsizeinputform' ]),
  FieldSchema.defaultedFunction('initValue', Fun.constant({ width: '', height: '' }))
];

export const contextFormSchema = StructureSchema.choose(
  'type',
  {
    contextform: contextFormFields,
    contextsliderform: contextSliderFormFields,
    contextsizeinputform: contextSizeInputFormFields
  }
);

export const createContextForm = (spec: ContextFormSpec): Result<ContextForm, StructureSchema.SchemaError<any>> =>
  StructureSchema.asRaw<ContextForm>('ContextForm', contextFormSchema, spec);
