import { FieldSchema, StructureSchema } from '@ephox/boulder';
import { Optional, Result } from '@ephox/katamari';

import * as ComponentSchema from '../../core/ComponentSchema';
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

const cardMenuItemSchema = StructureSchema.objOf([
  ComponentSchema.type,
  ComponentSchema.optionalLabel,
  FieldSchema.requiredArrayOf('items', itemSchema),
  ComponentSchema.onSetup,
  ComponentSchema.defaultedOnAction
].concat(commonMenuItemFields));

export const createCardMenuItem = (spec: CardMenuItemSpec): Result<CardMenuItem, StructureSchema.SchemaError<any>> =>
  StructureSchema.asRaw('cardmenuitem', cardMenuItemSchema, spec);
