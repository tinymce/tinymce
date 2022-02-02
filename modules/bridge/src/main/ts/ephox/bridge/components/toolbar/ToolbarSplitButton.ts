import { FieldSchema, StructureSchema } from '@ephox/boulder';
import { Fun, Optional, Result } from '@ephox/katamari';

import { ChoiceMenuItemSpec, SeparatorMenuItemSpec } from '../../api/Menu';

// Temporarily disable separators until things are clearer
export type ToolbarSplitButtonItemTypes = ChoiceMenuItemSpec | SeparatorMenuItemSpec;
export type SuccessCallback = (menu: ToolbarSplitButtonItemTypes[]) => void;
export type SelectPredicate = (value: string) => boolean;

export type PresetTypes = 'color' | 'normal' | 'listpreview';
export type PresetItemTypes = 'color' | 'normal';
export type ColumnTypes = number | 'auto';

export interface ToolbarSplitButtonSpec {
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
  tooltip: Optional<string>;
  icon: Optional<string>;
  text: Optional<string>;
  select: Optional<SelectPredicate>;
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
  setIconStroke: (id: string, value: string) => void; // Deprecated as of TinyMCE 5.8 (see TINY-3551)
  isActive: () => boolean;
  setActive: (state: boolean) => void;
}

export const splitButtonSchema = StructureSchema.objOf([
  FieldSchema.requiredString('type'),
  FieldSchema.optionString('tooltip'),
  FieldSchema.optionString('icon'),
  FieldSchema.optionString('text'),
  FieldSchema.optionFunction('select'),
  FieldSchema.requiredFunction('fetch'),
  FieldSchema.defaultedFunction('onSetup', () => Fun.noop),
  // TODO: Validate the allowed presets
  FieldSchema.defaultedStringEnum('presets', 'normal', [ 'normal', 'color', 'listpreview' ]),
  FieldSchema.defaulted('columns', 1),
  FieldSchema.requiredFunction('onAction'),
  FieldSchema.requiredFunction('onItemAction')
]);

export const isSplitButtonButton = (spec: any): spec is ToolbarSplitButton => spec.type === 'splitbutton';

export const createSplitButton = (spec: ToolbarSplitButtonSpec): Result<ToolbarSplitButton, StructureSchema.SchemaError<any>> =>
  StructureSchema.asRaw<ToolbarSplitButton>('SplitButton', splitButtonSchema, spec);
