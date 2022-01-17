import { FieldSchema, StructureSchema } from '@ephox/boulder';
import { Result } from '@ephox/katamari';

import * as ComponentSchema from '../../../core/ComponentSchema';
import { cardImageSchema } from './CardImage';
import { CardItem, CardItemSpec } from './CardItem';
import { cardTextSchema } from './CardText';

type CardContainerDirection = 'vertical' | 'horizontal';
type CardContainerAlign = 'left' | 'right';
type CardContainerValign = 'top' | 'middle' | 'bottom';

export interface CardContainerSpec {
  type: 'cardcontainer';
  items: CardItemSpec[];
  direction?: CardContainerDirection;
  align?: CardContainerAlign;
  valign?: CardContainerValign;
}

export interface CardContainer {
  type: 'cardcontainer';
  items: CardItem[];
  direction: CardContainerDirection;
  align: CardContainerAlign;
  valign: CardContainerValign;
}

export const itemSchema = StructureSchema.valueThunkOf(
  () => StructureSchema.chooseProcessor('type', {
    cardimage: cardImageSchema,
    cardtext: cardTextSchema,
    cardcontainer: cardContainerSchema
  })
);

export const cardContainerSchema = StructureSchema.objOf([
  ComponentSchema.type,
  FieldSchema.defaultedString('direction', 'horizontal'),
  FieldSchema.defaultedString('align', 'left'),
  FieldSchema.defaultedString('valign', 'middle'),
  FieldSchema.requiredArrayOf('items', itemSchema)
]);

export const createCardContainer = (spec: CardContainerSpec): Result<CardContainer, StructureSchema.SchemaError<any>> =>
  StructureSchema.asRaw<CardContainer>('cardcontainer', cardContainerSchema, spec);
