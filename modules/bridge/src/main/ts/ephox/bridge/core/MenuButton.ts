import { FieldSchema } from '@ephox/boulder';
import { Fun, Optional } from '@ephox/katamari';

import { NestedMenuItemContents } from '../components/menu/NestedMenuItem';

export type MenuButtonItemTypes = NestedMenuItemContents;
export type SuccessCallback = (menu: string | MenuButtonItemTypes[]) => void;

export interface BaseMenuButtonSpec {
  text?: string;
  tooltip?: string;
  icon?: string;
  fetch: (success: SuccessCallback) => void;
  onSetup?: (api: BaseMenuButtonInstanceApi) => (api: BaseMenuButtonInstanceApi) => void;
}

export interface BaseMenuButton {
  text: Optional<string>;
  tooltip: Optional<string>;
  icon: Optional<string>;
  fetch: (success: SuccessCallback) => void;
  onSetup: (api: BaseMenuButtonInstanceApi) => (api: BaseMenuButtonInstanceApi) => void;
}

export interface BaseMenuButtonInstanceApi {
  isDisabled: () => boolean;
  setDisabled: (state: boolean) => void;
  isActive: () => boolean;
  setActive: (state: boolean) => void;
}

export const baseMenuButtonFields = [
  FieldSchema.optionString('text'),
  FieldSchema.optionString('tooltip'),
  FieldSchema.optionString('icon'),
  FieldSchema.requiredFunction('fetch'),
  FieldSchema.defaultedFunction('onSetup', () => Fun.noop)
];
