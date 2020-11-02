import { FieldSchema, ValueSchema } from '@ephox/boulder';
import { Result } from '@ephox/katamari';
import { ContainerItem, ContainerItemSpec } from '../CardMenuItem';
import { imageSchema } from './Image';
import { titleSchema } from './Title';

export interface CardContainerSpec {
  type: 'cardcontainer';
  direction?: 'vertical' | 'horizontal';
  items: ContainerItemSpec[];
}

export interface CardContainer {
  type: 'cardcontainer';
  direction: 'vertical' | 'horizontal';
  items: ContainerItem[];
}

export const itemSchema = ValueSchema.valueThunkOf(
  () => ValueSchema.chooseProcessor('type', {
    image: imageSchema,
    title: titleSchema,
    cardcontainer: cardContainerSchema
  })
);

export const cardContainerSchema = ValueSchema.objOf([
  FieldSchema.strictString('type'),
  FieldSchema.defaultedString('direction', 'horizontal'),
  FieldSchema.strictArrayOf('items', itemSchema)
]);

export const createCardContainer = (spec: CardContainerSpec): Result<CardContainer, ValueSchema.SchemaError<any>> =>
  ValueSchema.asRaw<CardContainer>('cardcontainer', cardContainerSchema, spec);
