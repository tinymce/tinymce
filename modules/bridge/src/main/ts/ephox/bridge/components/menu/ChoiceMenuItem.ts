import { FieldSchema, StructureSchema } from '@ephox/boulder';
import { Optional, Result } from '@ephox/katamari';

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
  FieldSchema.requiredString('type'),
  FieldSchema.defaultedBoolean('active', false),
  FieldSchema.optionString('icon')
].concat(commonMenuItemFields));

export const createChoiceMenuItem = (spec: ChoiceMenuItemSpec): Result<ChoiceMenuItem, StructureSchema.SchemaError<any>> =>
  StructureSchema.asRaw('choicemenuitem', choiceMenuItemSchema, spec);
