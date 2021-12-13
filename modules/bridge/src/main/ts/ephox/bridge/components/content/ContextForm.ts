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

export interface ContextFormButtonSpec extends BaseToolbarButtonSpec<ContextFormButtonInstanceApi> {
  type?: 'contextformbutton';
  primary?: boolean;
  onAction: (formApi: ContextFormInstanceApi, api: ContextFormButtonInstanceApi) => void;
}

export interface ContextFormToggleButtonSpec extends BaseToolbarToggleButtonSpec<ContextFormToggleButtonInstanceApi> {
  type?: 'contextformtogglebutton';
  onAction: (formApi: ContextFormInstanceApi, buttonApi: ContextFormToggleButtonInstanceApi) => void;
  primary?: boolean;
}

export interface ContextFormButton extends BaseToolbarButton<ContextFormButtonInstanceApi> {
  type?: 'contextformbutton';
  primary?: boolean;
  onAction: (formApi: ContextFormInstanceApi, buttonApi: ContextFormButtonInstanceApi) => void;
  original: ContextFormButtonSpec;
}

export interface ContextFormToggleButton extends BaseToolbarToggleButton<ContextFormToggleButtonInstanceApi> {
  type?: 'contextformtogglebutton';
  primary?: boolean;
  onAction: (formApi: ContextFormInstanceApi, buttonApi: ContextFormToggleButtonInstanceApi) => void;
  original: ContextFormToggleButtonSpec;
}

export interface ContextFormInstanceApi {
  hide: () => void;
  getValue: () => string; // Maybe we need to support other data types?
}

export interface ContextFormSpec extends ContextBarSpec {
  type?: 'contextform';
  initValue?: () => string;
  label?: string;
  launch?: ContextFormLaunchButtonApi | ContextFormLaunchToggleButtonSpec;
  commands: Array<ContextFormToggleButtonSpec | ContextFormButtonSpec>;
}

export interface ContextForm extends ContextBar {
  type: 'contextform';
  initValue: () => string;
  label: Optional<string>;
  launch: Optional<ContextFormLaunchButton | ContextFormLaunchToggleButton>;
  commands: Array<ContextFormToggleButton | ContextFormButton>;
}

const contextButtonFields = baseToolbarButtonFields.concat([
  ComponentSchema.defaultedType('contextformbutton'),
  ComponentSchema.primary,
  ComponentSchema.onAction,
  FieldSchema.customField('original', Fun.identity)
]);

const contextToggleButtonFields = baseToolbarToggleButtonFields.concat([
  ComponentSchema.defaultedType('contextformbutton'),
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

const contextFormSchema = StructureSchema.objOf([
  ComponentSchema.defaultedType('contextform'),
  FieldSchema.defaultedFunction('initValue', Fun.constant('')),
  ComponentSchema.optionalLabel,
  FieldSchema.requiredArrayOf('commands', toggleOrNormal),
  FieldSchema.optionOf('launch', StructureSchema.choose('type', {
    contextformbutton: launchButtonFields,
    contextformtogglebutton: launchToggleButtonFields
  }))
].concat(contextBarFields));

export const createContextForm = (spec: ContextFormSpec): Result<ContextForm, StructureSchema.SchemaError<any>> =>
  StructureSchema.asRaw<ContextForm>('ContextForm', contextFormSchema, spec);
