import { FieldSchema, ValueSchema, ValueType } from '@ephox/boulder';
import { Optional, Result } from '@ephox/katamari';

export interface CardImageSpec {
  type: 'cardimage';
  src: string;
  alt?: string;
  classes?: string[];
}

export interface CardImage {
  type: 'cardimage';
  src: string;
  alt: Optional<string>;
  classes: string[];
}

const cardImageFields = [
  FieldSchema.requiredString('type'),
  FieldSchema.requiredString('src'),
  FieldSchema.optionString('alt'),
  FieldSchema.defaultedArrayOf('classes', [], ValueType.string)
];

export const cardImageSchema = ValueSchema.objOf(cardImageFields);

export const createCardImage = (spec: CardImageSpec): Result<CardImage, ValueSchema.SchemaError<any>> =>
  ValueSchema.asRaw<CardImage>('cardimage', cardImageSchema, spec);
