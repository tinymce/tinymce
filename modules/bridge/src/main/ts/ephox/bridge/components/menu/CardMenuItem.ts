import { FieldSchema, ValueSchema } from '@ephox/boulder';
import { Fun, Optional, Result } from '@ephox/katamari';
import { itemSchema } from './card/CardContainer';
import { CardItem, CardItemSpec } from './card/CardItem';
import { CommonMenuItem, commonMenuItemFields, CommonMenuItemInstanceApi, CommonMenuItemSpec } from './CommonMenuItem';

export interface CardMenuItemInstanceApi extends CommonMenuItemInstanceApi { }

export interface CardMenuItemSpec extends Omit<CommonMenuItemSpec, 'text' | 'shortcut'> {
  type: 'cardmenuitem';
  label?: string;
  items: CardItemSpec[];
  onSetup?: (api: CardMenuItemInstanceApi) => (api: CardMenuItemInstanceApi) => void;
  onAction?: (api: CardMenuItemInstanceApi) => void;
}

export interface CardMenuItem extends Omit<CommonMenuItem, 'text' | 'shortcut'> {
  type: 'cardmenuitem';
  label: Optional<string>;
  items: CardItem[];
  onSetup: (api: CardMenuItemInstanceApi) => (api: CardMenuItemInstanceApi) => void;
  onAction: (api: CardMenuItemInstanceApi) => void;
}

const cardMenuItemSchema = ValueSchema.objOf([
  FieldSchema.strictString('type'),
  FieldSchema.optionString('label'),
  FieldSchema.strictArrayOf('items', itemSchema),
  FieldSchema.defaultedFunction('onSetup', () => Fun.noop),
  FieldSchema.defaultedFunction('onAction', Fun.noop)
].concat(commonMenuItemFields));

export const createCardMenuItem = (spec: CardMenuItemSpec): Result<CardMenuItem, ValueSchema.SchemaError<any>> =>
  ValueSchema.asRaw('cardmenuitem', cardMenuItemSchema, spec);
