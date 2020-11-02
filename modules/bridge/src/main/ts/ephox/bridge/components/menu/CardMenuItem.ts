import { FieldSchema, ValueSchema } from '@ephox/boulder';
import { Fun, Optional, Result } from '@ephox/katamari';
import { CardContainer, CardContainerSpec, itemSchema } from './card/CardContainer';
import { Description, DescriptionSpec } from './card/Description';
import { Image, ImageSpec } from './card/Image';
import { Title, TitleSpec } from './card/Title';
import { CommonMenuItem, commonMenuItemFields, CommonMenuItemInstanceApi, CommonMenuItemSpec } from './CommonMenuItem';

export type ContainerItemSpec =
  CardContainerSpec |
  ImageSpec |
  DescriptionSpec |
  TitleSpec;

export type ContainerItem =
  CardContainer |
  Image |
  Description |
  Title;

export interface CardMenuItemInstanceApi extends CommonMenuItemInstanceApi { }

export interface CardMenuItemSpec extends Omit<CommonMenuItemSpec, 'text'> {
  type: 'cardmenuitem';
  ariaLabel?: string;
  items: ContainerItemSpec[];
  onSetup?: (api: CardMenuItemInstanceApi) => (api: CardMenuItemInstanceApi) => void;
  onAction?: (api: CardMenuItemInstanceApi) => void;
}

export interface CardMenuItem extends Omit<CommonMenuItem, 'text'> {
  type: 'cardmenuitem';
  ariaLabel: Optional<string>;
  items: ContainerItem[];
  onSetup: (api: CardMenuItemInstanceApi) => (api: CardMenuItemInstanceApi) => void;
  onAction: (api: CardMenuItemInstanceApi) => void;
}

const cardMenuItemSchema = ValueSchema.objOf([
  FieldSchema.strictString('type'),
  FieldSchema.optionString('ariaLabel'),
  FieldSchema.strictArrayOf('items', itemSchema),
  FieldSchema.defaultedFunction('onSetup', () => Fun.noop),
  FieldSchema.defaultedFunction('onAction', Fun.noop)
].concat(commonMenuItemFields));

export const createCardMenuItem = (spec: CardMenuItemSpec): Result<CardMenuItem, ValueSchema.SchemaError<any>> =>
  ValueSchema.asRaw('cardmenuitem', cardMenuItemSchema, spec);
