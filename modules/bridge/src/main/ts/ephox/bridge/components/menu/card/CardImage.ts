import { FieldSchema, StructureSchema, ValueType } from '@ephox/boulder';
import { Optional, Result } from '@ephox/katamari';

import * as ComponentSchema from '../../../core/ComponentSchema';

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
  ComponentSchema.type,
  FieldSchema.requiredString('src'),
  FieldSchema.optionString('alt'),
  FieldSchema.defaultedArrayOf('classes', [], ValueType.string)
];

export const cardImageSchema = StructureSchema.objOf(cardImageFields);

export const createCardImage = (spec: CardImageSpec): Result<CardImage, StructureSchema.SchemaError<any>> =>
  StructureSchema.asRaw<CardImage>('cardimage', cardImageSchema, spec);
