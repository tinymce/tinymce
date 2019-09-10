import { Option, Fun, Cell } from '@ephox/katamari';
import { FieldSchema } from '@ephox/boulder';

import { DialogToggleMenuItemApi, dialogToggleMenuItemSchema } from './ToggleMenuItem';

export type DialogMenuButtonItemTypes = DialogToggleMenuItemApi;

export interface DialogMenuButtonApi {
  text?: string;
  tooltip?: string;
  icon?: string;
  items: DialogMenuButtonItemTypes[];
  onSetup?: (api: DialogMenuButtonInstanceApi) => (api: DialogMenuButtonInstanceApi) => void;
}

export interface DialogMenuButton {
  name: string;
  align: 'start' | 'end';
  type: 'menu';
  text: Option<string>;
  tooltip: Option<string>;
  icon: Option<string>;
  items: DialogMenuButtonItemTypes[];
  onSetup: (api: DialogMenuButtonInstanceApi) => (api: DialogMenuButtonInstanceApi) => void;
  storage: Cell<Boolean>;
}

export interface DialogMenuButtonInstanceApi {
  isDisabled: () => boolean;
  setDisabled: (state: boolean) => void;
  isActive: () => boolean;
  setActive: (state: boolean) => void;
}

export const dialogMenuButtonFields = [
  FieldSchema.optionString('text'),
  FieldSchema.optionString('tooltip'),
  FieldSchema.optionString('icon'),
  FieldSchema.strictArrayOf('items', dialogToggleMenuItemSchema),
  FieldSchema.defaultedFunction('onSetup', () => Fun.noop),
  FieldSchema.defaulted('storage', Cell<Boolean>(false))
];
