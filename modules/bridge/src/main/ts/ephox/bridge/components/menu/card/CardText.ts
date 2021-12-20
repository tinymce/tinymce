import { FieldSchema, StructureSchema, ValueType } from '@ephox/boulder';
import { Optional, Result } from '@ephox/katamari';

import * as ComponentSchema from '../../../core/ComponentSchema';

export interface CardTextSpec {
  type: 'cardtext';
  text: string;
  name?: string;
  classes?: string[];
}

export interface CardText {
  type: 'cardtext';
  text: string;
  name: Optional<string>;
  classes: string[];
}

const cardTextFields = [
  ComponentSchema.type,
  ComponentSchema.text,
  ComponentSchema.optionalName,
  FieldSchema.defaultedArrayOf('classes', [ 'tox-collection__item-label' ], ValueType.string)
];

export const cardTextSchema = StructureSchema.objOf(cardTextFields);

export const createCardText = (spec: CardTextSpec): Result<CardText, StructureSchema.SchemaError<any>> =>
  StructureSchema.asRaw<CardText>('cardtext', cardTextSchema, spec);
