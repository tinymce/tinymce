import { FieldSchema, ValueSchema } from '@ephox/boulder';
import { Fun, Result } from '@ephox/katamari';
import { Title, TitleSpec } from './Title';
import { CommonMenuItem, commonMenuItemFields, CommonMenuItemInstanceApi, CommonMenuItemSpec } from './CommonMenuItem';
import { Container, ContainerSpec, itemSchema } from './Container';
import { Description, DescriptionSpec } from './Description';
import { Image, ImageSpec } from './Image';

export type ContainerItemSpec =
  ContainerSpec |
  ImageSpec |
  DescriptionSpec |
  TitleSpec;

export type ContainerItem =
  Container |
  Image |
  Description |
  Title;

export interface CardMenuItemInstanceApi extends CommonMenuItemInstanceApi { }

export interface CardMenuItemSpec extends CommonMenuItemSpec {
  type: 'cardmenuitem';
  items: ContainerItemSpec[];
  onSetup?: (api: CardMenuItemInstanceApi) => (api: CardMenuItemInstanceApi) => void;
  onAction?: (api: CardMenuItemInstanceApi) => void;
}

export interface CardMenuItem extends CommonMenuItem {
  type: 'cardmenuitem';
  items: ContainerItem[];
  onSetup: (api: CardMenuItemInstanceApi) => (api: CardMenuItemInstanceApi) => void;
  onAction: (api: CardMenuItemInstanceApi) => void;
}

const cardMenuItemSchema = ValueSchema.objOf([
  FieldSchema.strictString('type'),
  FieldSchema.defaultedFunction('onSetup', () => Fun.noop),
  FieldSchema.defaultedFunction('onAction', Fun.noop),
  FieldSchema.strictArrayOf('items', itemSchema)
].concat(commonMenuItemFields));

export const createCardMenuItem = (spec: CardMenuItemSpec): Result<CardMenuItem, ValueSchema.SchemaError<any>> =>
  ValueSchema.asRaw('cardmenuitem', cardMenuItemSchema, spec);
