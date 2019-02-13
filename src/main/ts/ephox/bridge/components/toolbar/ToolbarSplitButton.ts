import { FieldSchema, Processor, ValueSchema } from '@ephox/boulder';
import { Fun, Option, Result } from '@ephox/katamari';

import { ChoiceMenuItemApi, SeparatorMenuItemApi } from '../../api/Menu';

// Temporarily disable separators until things are clearer
export type ToolbarSplitButtonItemTypes = ChoiceMenuItemApi | SeparatorMenuItemApi;
export type SuccessCallback = (menu: ToolbarSplitButtonItemTypes[]) => void;
export type SelectPredicate = (value: string) => boolean;

export type PresetTypes = 'color' | 'normal' | 'listpreview';
export type PresetItemTypes = 'color' | 'normal';
export type ColumnTypes = number | 'auto';

export interface ToolbarSplitButtonApi {
  type?: 'splitbutton';
  tooltip?: string;
  icon?: string;
  text?: string;
  select?: SelectPredicate;
  presets?: PresetTypes;
  columns?: ColumnTypes;
  fetch: (success: SuccessCallback) => void;
  onSetup?: (api: ToolbarSplitButtonInstanceApi) => (api: ToolbarSplitButtonInstanceApi) => void;
  onAction: (api: ToolbarSplitButtonInstanceApi) => void;
  onItemAction: (api: ToolbarSplitButtonInstanceApi, value: string) => void;
}

export interface ToolbarSplitButton {
  type: 'splitbutton';
  tooltip: Option<string>;
  icon: Option<string>;
  text: Option<string>;
  select: Option<SelectPredicate>;
  presets: PresetTypes;
  columns: ColumnTypes;
  fetch: (success: SuccessCallback) => void;
  onSetup: (api: ToolbarSplitButtonInstanceApi) => (api: ToolbarSplitButtonInstanceApi) => void;
  onAction: (api: ToolbarSplitButtonInstanceApi) => void;
  onItemAction: (api: ToolbarSplitButtonInstanceApi, value: string) => void;
}

export interface ToolbarSplitButtonInstanceApi {
  isDisabled: () => boolean;
  setDisabled: (state: boolean) => void;
  setIconFill: (id: string, value: string) => void;
  setIconStroke: (id: string, value: string) => void;
  isActive: () => boolean;
  setActive: (state: boolean) => void;
}

export const splitButtonSchema = ValueSchema.objOf([
  FieldSchema.strictString('type'),
  FieldSchema.optionString('tooltip'),
  FieldSchema.optionString('icon'),
  FieldSchema.optionString('text'),
  FieldSchema.optionFunction('select'),
  FieldSchema.strictFunction('fetch'),
  FieldSchema.defaultedFunction('onSetup', () => Fun.noop),
  // TODO: Validate the allowed presets
  FieldSchema.defaultedStringEnum('presets', 'normal', ['normal', 'color', 'listpreview']),
  FieldSchema.defaulted('columns', 1),
  FieldSchema.strictFunction('onAction'),
  FieldSchema.strictFunction('onItemAction')
]) as Processor;

export const isSplitButtonButton = (spec: any): spec is ToolbarSplitButton => spec.type === 'splitbutton';

export const createSplitButton = (spec: any): Result<ToolbarSplitButton, ValueSchema.SchemaError<any>> =>
  ValueSchema.asRaw<ToolbarSplitButton>('SplitButton', splitButtonSchema, spec);
