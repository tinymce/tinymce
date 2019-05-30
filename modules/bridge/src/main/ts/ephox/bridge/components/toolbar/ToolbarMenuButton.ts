import { ValueSchema, FieldSchema, Processor } from '@ephox/boulder';
import { Result, Option, Fun } from '@ephox/katamari';
import { NestedMenuItemContents } from '../../api/Menu';

export type ToolbarMenuButtonItemTypes = NestedMenuItemContents;
export type SuccessCallback = (menu: string | ToolbarMenuButtonItemTypes[]) => void;

export interface ToolbarMenuButtonApi {
  type?: 'menubutton';
  tooltip?: string;
  icon?: string;
  text?: string;
  fetch: (success: SuccessCallback) => void;
  onSetup?: (api: ToolbarMenuButtonInstanceApi) => (api: ToolbarMenuButtonInstanceApi) => void;
}

export interface ToolbarMenuButton {
  type: 'menubutton';
  tooltip: Option<string>;
  icon: Option<string>;
  text: Option<string>;
  fetch: (success: SuccessCallback) => void;
  onSetup: (api: ToolbarMenuButtonInstanceApi) => (api: ToolbarMenuButtonInstanceApi) => void;
}

export interface ToolbarMenuButtonInstanceApi {
  isDisabled: () => boolean;
  setDisabled: (state: boolean) => void;
  isActive: () => boolean;
  setActive: (state: boolean) => void;
}

export const MenuButtonSchema = ValueSchema.objOf([
  FieldSchema.strictString('type'),
  FieldSchema.optionString('tooltip'),
  FieldSchema.optionString('icon'),
  FieldSchema.optionString('text'),
  FieldSchema.strictFunction('fetch'),
  FieldSchema.defaultedFunction('onSetup', () => Fun.noop)
]) as Processor;

export const isMenuButtonButton = (spec: any): spec is ToolbarMenuButton => spec.type === 'menubutton';

export const createMenuButton = (spec: any): Result<ToolbarMenuButton, ValueSchema.SchemaError<any>> => {
  return ValueSchema.asRaw<ToolbarMenuButton>('menubutton', MenuButtonSchema, spec);
};
