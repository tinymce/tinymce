import { FieldSchema, ValueSchema } from '@ephox/boulder';
import { Fun, Optional, Result } from '@ephox/katamari';
import { CardContainer, CardContainerSpec, itemSchema } from './card/CardContainer';
import { CardImage, CardImageSpec } from './card/CardImage';
import { CardText, CardTextSpec } from './card/CardText';
import { CommonMenuItem, commonMenuItemFields, CommonMenuItemInstanceApi, CommonMenuItemSpec } from './CommonMenuItem';

export type ContainerItemSpec =
  CardContainerSpec |
  CardImageSpec |
  CardTextSpec;

export type ContainerItem =
  CardContainer |
  CardImage |
  CardText;

export interface CardMenuItemInstanceApi extends CommonMenuItemInstanceApi { }

export interface CardMenuItemSpec extends Omit<CommonMenuItemSpec, 'text' | 'shortcut'> {
  type: 'cardmenuitem';
  label?: string;
  items: ContainerItemSpec[];
  onSetup?: (api: CardMenuItemInstanceApi) => (api: CardMenuItemInstanceApi) => void;
  onAction?: (api: CardMenuItemInstanceApi) => void;
}

export interface CardMenuItem extends Omit<CommonMenuItem, 'text'> {
  type: 'cardmenuitem';
  label: Optional<string>;
  items: ContainerItem[];
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
