import { FieldSchema, ValueSchema } from '@ephox/boulder';
import { Option, Result } from '@ephox/katamari';
import { CommonMenuItem, CommonMenuItemApi, commonMenuItemFields, CommonMenuItemInstanceApi } from './CommonMenuItem';

export interface ChoiceMenuItemApi extends CommonMenuItemApi {
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
  icon: Option<string>;
}

export const choiceMenuItemSchema = ValueSchema.objOf([
  FieldSchema.strictString('type'),
  FieldSchema.defaultedBoolean('active', false),
  FieldSchema.optionString('icon')
].concat(commonMenuItemFields));

export const createChoiceMenuItem = (spec: ChoiceMenuItemApi): Result<ChoiceMenuItem, ValueSchema.SchemaError<any>> => ValueSchema.asRaw('choicemenuitem', choiceMenuItemSchema, spec);
