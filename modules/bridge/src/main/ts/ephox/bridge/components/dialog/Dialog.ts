import { FieldSchema, ValueSchema } from '@ephox/boulder';
import { Fun, Result } from '@ephox/katamari';
import * as FooterButton from './DialogFooterButton';
import * as Panel from './Panel';
import * as TabPanel from './TabPanel';

export type DialogDataItem = any;
export type DialogData = Record<string, DialogDataItem>;

export interface DialogInstanceApi<T extends DialogData> {
  getData: () => T;
  setData: (data: Partial<T>) => void;
  disable: (name: string) => void;
  focus: (name: string) => void;
  showTab: (name: string) => void;
  redial: (nu: DialogSpec<T>) => void;
  enable: (name: string) => void;
  block: (msg: string) => void;
  unblock: () => void;
  close: () => void;
}

export interface DialogActionDetails {
  name: string;
  value?: any;
}

export interface DialogChangeDetails<T> {
  name: keyof T;
}

export interface DialogTabChangeDetails {
  newTabName: string;
  oldTabName: string;
}

export type DialogActionHandler<T> = (api: DialogInstanceApi<T>, details: DialogActionDetails) => void;
export type DialogChangeHandler<T> = (api: DialogInstanceApi<T>, details: DialogChangeDetails<T>) => void;
export type DialogSubmitHandler<T> = (api: DialogInstanceApi<T>) => void;
export type DialogCloseHandler = () => void;
export type DialogCancelHandler<T> = (api: DialogInstanceApi<T>) => void;
export type DialogTabChangeHandler<T> = (api: DialogInstanceApi<T>, details: DialogTabChangeDetails) => void;

export type DialogSize = 'normal' | 'medium' | 'large';
export interface DialogSpec<T extends DialogData> {
  title: string;
  size?: DialogSize;
  body: TabPanel.TabPanelSpec | Panel.PanelSpec;
  buttons: FooterButton.DialogFooterButtonSpec[];
  initialData?: T;

  // Gets fired when a component within the dialog has an action used by some components
  onAction?: DialogActionHandler<T>;

  // Gets fired when a value is changed while the dialog is open
  onChange?: DialogChangeHandler<T>;

  // Gets fired when the dialog form has valid data and submit/enter is pressed
  onSubmit?: DialogSubmitHandler<T>;

  // Gets fired when the dialog is closed for any reason
  onClose?: DialogCloseHandler;

  // Gets fired when the dialog is manually closed using Esc key or cancel/X button
  onCancel?: DialogCancelHandler<T>;

  // Gets fired the dialog changes tab
  onTabChange?: DialogTabChangeHandler<T>;
}

export interface Dialog<T> {
  title: string;
  size: DialogSize;
  body: TabPanel.TabPanel | Panel.Panel;
  buttons: FooterButton.DialogFooterButton[];
  initialData: T;
  onAction: DialogActionHandler<T>;
  onChange: DialogChangeHandler<T>;
  onSubmit: DialogSubmitHandler<T>;
  onClose: DialogCloseHandler;
  onCancel: DialogCancelHandler<T>;
  onTabChange: DialogTabChangeHandler<T>;
}

export const dialogButtonFields = FooterButton.dialogFooterButtonFields;
export const dialogButtonSchema = FooterButton.dialogFooterButtonSchema;

export const dialogSchema = ValueSchema.objOf([
  FieldSchema.strictString('title'),
  FieldSchema.strictOf('body', ValueSchema.chooseProcessor('type', {
    panel: Panel.panelSchema,
    tabpanel: TabPanel.tabPanelSchema
  })),
  FieldSchema.defaultedString('size', 'normal'),
  FieldSchema.strictArrayOf('buttons', dialogButtonSchema),
  FieldSchema.defaulted('initialData', {}),
  FieldSchema.defaultedFunction('onAction', Fun.noop),
  FieldSchema.defaultedFunction('onChange', Fun.noop),
  FieldSchema.defaultedFunction('onSubmit', Fun.noop),
  FieldSchema.defaultedFunction('onClose', Fun.noop),
  FieldSchema.defaultedFunction('onCancel', Fun.noop),
  FieldSchema.defaulted('onTabChange', Fun.noop)
]);

export const createDialog = <T>(spec: DialogSpec<T>): Result<Dialog<T>, ValueSchema.SchemaError<any>> =>
  ValueSchema.asRaw('dialog', dialogSchema, spec);
