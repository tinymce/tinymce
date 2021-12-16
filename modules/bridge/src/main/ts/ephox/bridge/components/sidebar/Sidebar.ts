import { FieldSchema, StructureSchema } from '@ephox/boulder';
import { Fun, Optional, Result } from '@ephox/katamari';

import * as ComponentSchema from '../../core/ComponentSchema';

export interface SidebarInstanceApi {
  element: () => HTMLElement;
}

export interface SidebarSpec {
  icon?: string;
  tooltip?: string;
  onShow?: (api: SidebarInstanceApi) => void;
  onSetup?: (api: SidebarInstanceApi) => (api: SidebarInstanceApi) => void;
  onHide?: (api: SidebarInstanceApi) => void;
}

export interface Sidebar {
  icon: Optional<string>;
  tooltip: Optional<string>;
  onShow: (api: SidebarInstanceApi) => void;
  onSetup: (api: SidebarInstanceApi) => (api: SidebarInstanceApi) => void;
  onHide: (api: SidebarInstanceApi) => void;
}

export const sidebarSchema = StructureSchema.objOf([
  ComponentSchema.optionalIcon,
  ComponentSchema.optionalTooltip,
  FieldSchema.defaultedFunction('onShow', Fun.noop),
  FieldSchema.defaultedFunction('onHide', Fun.noop),
  ComponentSchema.onSetup
]);

export const createSidebar = (spec: SidebarSpec): Result<Sidebar, StructureSchema.SchemaError<any>> => StructureSchema.asRaw('sidebar', sidebarSchema, spec);
