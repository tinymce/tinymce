import { HTMLElement } from '@ephox/dom-globals';
import { Fun, Option, Result } from '@ephox/katamari';
import { FieldSchema, ValueSchema } from '@ephox/boulder';

export interface SidebarInstanceApi {
  element: () => HTMLElement;
}

export interface SidebarApi {
  icon?: string;
  tooltip?: string;
  onShow?: (api: SidebarInstanceApi) => void;
  onSetup?: (api: SidebarInstanceApi) => (api: SidebarInstanceApi) => void;
  onHide?: (api: SidebarInstanceApi) => void;
}

export interface Sidebar {
  icon: Option<string>;
  tooltip: Option<string>;
  onShow: (api: SidebarInstanceApi) => void;
  onSetup: (api: SidebarInstanceApi) => (api: SidebarInstanceApi) => void;
  onHide: (api: SidebarInstanceApi) => void;
}

export const sidebarSchema = ValueSchema.objOf([
  FieldSchema.optionString('icon'),
  FieldSchema.optionString('tooltip'),
  FieldSchema.defaultedFunction('onShow', Fun.noop),
  FieldSchema.defaultedFunction('onHide', Fun.noop),
  FieldSchema.defaultedFunction('onSetup', () => Fun.noop)
]);

export const createSidebar = <T>(spec: SidebarApi): Result<Sidebar, ValueSchema.SchemaError<any>> => {
  return ValueSchema.asRaw('sidebar', sidebarSchema, spec);
};
