import { FieldSchema, ValueSchema } from '@ephox/boulder';
import { Element } from '@ephox/dom-globals';
import { Fun, Option, Result } from '@ephox/katamari';
import { BaseToolbarButton, BaseToolbarButtonApi, baseToolbarButtonFields, BaseToolbarButtonInstanceApi } from './ToolbarButton';
import {
  BaseToolbarToggleButton, BaseToolbarToggleButtonApi, baseToolbarToggleButtonFields, BaseToolbarToggleButtonInstanceApi
} from './ToolbarToggleButton';

export type ContextToolbarPosition = 'node' | 'selection' | 'line';
export type ContextScope = 'node' | 'editor';

interface ContextBarApi {
  predicate?: (elem: Element) => boolean;
  position?: ContextToolbarPosition;
  scope?: ContextScope;
}

interface ContextBar {
  predicate: (elem: Element) => boolean;
  position: ContextToolbarPosition;
  scope: ContextScope;
}

// tslint:disable-next-line:no-empty-interface
export interface ContextButtonInstanceApi extends BaseToolbarButtonInstanceApi {

}

// tslint:disable-next-line:no-empty-interface
export interface ContextToggleButtonInstanceApi extends BaseToolbarToggleButtonInstanceApi {

}

export interface ContextButtonApi extends BaseToolbarButtonApi<ContextButtonInstanceApi> {
  type?: 'contextformbutton';
  primary?: boolean;
  onAction: (formApi: ContextFormInstanceApi, api: ContextButtonInstanceApi) => void;
}

export interface ContextFormLaunchButtonApi extends BaseToolbarButtonApi<BaseToolbarButtonInstanceApi> {
  type: 'contextformbutton';
}

export interface ContextFormLaunchButton extends BaseToolbarButtonApi<BaseToolbarButtonInstanceApi> {
  type: 'contextformbutton';
}

export interface ContextFormLaunchToggleButtonApi extends BaseToolbarToggleButtonApi<BaseToolbarToggleButtonInstanceApi> {
  type: 'contextformtogglebutton';
}

export interface ContextFormLaunchToggleButton extends BaseToolbarToggleButtonApi<BaseToolbarToggleButtonInstanceApi> {
  type: 'contextformtogglebutton';
}

export interface ContextToggleButtonApi extends BaseToolbarToggleButtonApi<ContextToggleButtonInstanceApi> {
  type?: 'contextformtogglebutton';
  onAction: (formApi: ContextFormInstanceApi, buttonApi: ContextToggleButtonInstanceApi) => void;
  primary?: boolean;
}

export interface ContextButton extends BaseToolbarButton<ContextButtonInstanceApi> {
  type?: 'contextformbutton';
  primary?: boolean;
  onAction: (formApi: ContextFormInstanceApi, buttonApi: ContextButtonInstanceApi) => void;
  original: ContextButtonApi;
}

export interface ContextToggleButton extends BaseToolbarToggleButton<ContextToggleButtonInstanceApi> {
  type?: 'contextformtogglebutton';
  primary?: boolean;
  onAction: (formApi: ContextFormInstanceApi, buttonApi: ContextToggleButtonInstanceApi) => void;
  original: ContextToggleButtonApi;
}

export interface ContextToolbarApi extends ContextBarApi {
  type?: 'contexttoolbar';
  items: string;
}

export interface ContextToolbar extends ContextBar {
  type: 'contexttoolbar';
  items: string;
}

export interface ContextFormInstanceApi {
  hide: () => void;
  getValue: () => string; // Maybe we need to support other data types?
}

export interface ContextFormApi extends ContextBarApi {
  type?: 'contextform';
  initValue?: () => string;
  label?: string;
  launch?: ContextFormLaunchButtonApi | ContextFormLaunchToggleButtonApi;
  commands: Array<ContextToggleButtonApi | ContextButtonApi>;
}

export interface ContextForm extends ContextBar {
  type: 'contextform';
  initValue: () => string;
  label: Option<string>;
  launch: Option<ContextFormLaunchButton | ContextFormLaunchToggleButton>;
  commands: Array<ContextToggleButton | ContextButton>;
}

const contextBarFields = [
  FieldSchema.defaultedFunction('predicate', () => false),
  FieldSchema.defaultedStringEnum('scope', 'node', [ 'node', 'editor' ]),
  FieldSchema.defaultedStringEnum('position', 'selection', [ 'node', 'selection', 'line' ])
];

const contextButtonFields = baseToolbarButtonFields.concat([
  FieldSchema.defaulted('type', 'contextformbutton'),
  FieldSchema.defaulted('primary', false),
  FieldSchema.strictFunction('onAction'),
  FieldSchema.state('original', Fun.identity)
]);

const contextToggleButtonFields = baseToolbarToggleButtonFields.concat([
  FieldSchema.defaulted('type', 'contextformbutton'),
  FieldSchema.defaulted('primary', false),
  FieldSchema.strictFunction('onAction'),
  FieldSchema.state('original', Fun.identity)
]);

const launchButtonFields = baseToolbarButtonFields.concat([
  FieldSchema.defaulted('type', 'contextformbutton')
]);

const launchToggleButtonFields = baseToolbarToggleButtonFields.concat([
  FieldSchema.defaulted('type', 'contextformtogglebutton')
]);

const toggleOrNormal = ValueSchema.choose('type', {
  contextformbutton: contextButtonFields,
  contextformtogglebutton: contextToggleButtonFields
});

const contextFormSchema = ValueSchema.objOf([
  FieldSchema.defaulted('type', 'contextform'),
  FieldSchema.defaultedFunction('initValue', () => ''),
  FieldSchema.optionString('label'),
  FieldSchema.strictArrayOf('commands', toggleOrNormal),
  FieldSchema.optionOf('launch', ValueSchema.choose('type', {
    contextformbutton: launchButtonFields,
    contextformtogglebutton: launchToggleButtonFields
  }))
].concat(contextBarFields));

const contextToolbarSchema = ValueSchema.objOf([
  FieldSchema.defaulted('type', 'contexttoolbar'),
  FieldSchema.strictString('items')
].concat(contextBarFields));

export const createContextToolbar = (spec: ContextToolbarApi): Result<ContextToolbar, ValueSchema.SchemaError<any>> => ValueSchema.asRaw<ContextToolbar>('ContextToolbar', contextToolbarSchema, spec);

export const createContextForm = (spec: ContextFormApi): Result<ContextForm, ValueSchema.SchemaError<any>> => ValueSchema.asRaw<ContextForm>('ContextForm', contextFormSchema, spec);
