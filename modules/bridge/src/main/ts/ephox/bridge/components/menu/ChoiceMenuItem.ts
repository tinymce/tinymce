import { FieldSchema, ValueSchema } from '@ephox/boulder';
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

export const choiceMenuItemSchema = ValueSchema.objOf([
  FieldSchema.strictString('type'),
  FieldSchema.defaultedBoolean('active', false),
  FieldSchema.optionString('icon')
].concat(commonMenuItemFields));

export const createChoiceMenuItem = (spec: ChoiceMenuItemSpec): Result<ChoiceMenuItem, ValueSchema.SchemaError<any>> =>
  ValueSchema.asRaw('choicemenuitem', choiceMenuItemSchema, spec);
