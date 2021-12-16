import { StructureSchema } from '@ephox/boulder';
import { Optional, Result } from '@ephox/katamari';

import * as ComponentSchema from '../../core/ComponentSchema';
import { CommonMenuItem, CommonMenuItemSpec, commonMenuItemFields, CommonMenuItemInstanceApi } from './CommonMenuItem';

export interface ChoiceMenuItemSpec extends CommonMenuItemSpec {
  type?: 'choiceitem';
  icon?: string;
}

export interface ChoiceMenuItemInstanceApi extends CommonMenuItemInstanceApi {
  isActive: () => boolean;
  setActive: (state: boolean) => void;
}

export interface ChoiceMenuItem extends CommonMenuItem {
  type: 'choiceitem';
  active: boolean;
  icon: Optional<string>;
}

export const choiceMenuItemSchema = StructureSchema.objOf([
  ComponentSchema.type,
  ComponentSchema.active,
  ComponentSchema.optionalIcon
].concat(commonMenuItemFields));

export const createChoiceMenuItem = (spec: ChoiceMenuItemSpec): Result<ChoiceMenuItem, StructureSchema.SchemaError<any>> =>
  StructureSchema.asRaw('choicemenuitem', choiceMenuItemSchema, spec);
