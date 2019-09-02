import { Option, Fun } from '@ephox/katamari';
import { FieldSchema } from '@ephox/boulder';

import { DialogToggleMenuItemApi, dialogToggleMenuItemSchema } from './ToggleMenuItem';

export type DialogMenuButtonItemTypes = DialogToggleMenuItemApi;

export interface BaseDialogMenuButtonApi {
  text?: string;
  tooltip?: string;
  icon?: string;
  items: DialogMenuButtonItemTypes[];
  onSetup?: (api: BaseDialogMenuButtonInstanceApi) => (api: BaseDialogMenuButtonInstanceApi) => void;
}

export interface BaseDialogMenuButton {
  text: Option<string>;
  tooltip: Option<string>;
  icon: Option<string>;
  items: DialogMenuButtonItemTypes[];
  onSetup: (api: BaseDialogMenuButtonInstanceApi) => (api: BaseDialogMenuButtonInstanceApi) => void;
}

export interface BaseDialogMenuButtonInstanceApi {
  isDisabled: () => boolean;
  setDisabled: (state: boolean) => void;
  isActive: () => boolean;
  setActive: (state: boolean) => void;
}

export const baseDialogMenuButtonFields = [
  FieldSchema.optionString('text'),
  FieldSchema.optionString('tooltip'),
  FieldSchema.optionString('icon'),
  FieldSchema.strictArrayOf('items', dialogToggleMenuItemSchema),
  FieldSchema.defaultedFunction('onSetup', () => Fun.noop)
];
