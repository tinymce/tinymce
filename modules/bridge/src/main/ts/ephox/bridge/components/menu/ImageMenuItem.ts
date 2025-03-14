import { StructureSchema } from '@ephox/boulder';
import { Optional, Result } from '@ephox/katamari';

import * as ComponentSchema from '../../core/ComponentSchema';
import { CommonMenuItem, commonMenuItemFields, CommonMenuItemInstanceApi, CommonMenuItemSpec } from './CommonMenuItem';

export interface ImageMenuItemSpec extends CommonMenuItemSpec {
  type?: 'imageitem';
  url: string;
  label?: string;
  tooltip?: string;
}

export interface ImageMenuItemInstanceApi extends CommonMenuItemInstanceApi {
  isActive: () => boolean;
  setActive: (state: boolean) => void;
}

export interface ImageMenuItem extends CommonMenuItem {
  type: 'imageitem';
  active: boolean;
  url: string;
  label: Optional<string>;
  tooltip: Optional<string>;
}

export const imageMenuItemSchema = StructureSchema.objOf([
  ComponentSchema.type,
  ComponentSchema.active,
  ComponentSchema.url,
  ComponentSchema.optionalLabel,
  ComponentSchema.optionalTooltip
].concat(commonMenuItemFields));

export const createImageMenuItem = (spec: ImageMenuItemSpec): Result<ImageMenuItem, StructureSchema.SchemaError<any>> =>
  StructureSchema.asRaw('imagemenuitem', imageMenuItemSchema, spec);
