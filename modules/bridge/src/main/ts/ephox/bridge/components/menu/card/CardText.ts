import { FieldSchema, ValueSchema, ValueType } from '@ephox/boulder';
import { Optional, Result } from '@ephox/katamari';

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
  FieldSchema.requiredString('type'),
  FieldSchema.requiredString('text'),
  FieldSchema.optionString('name'),
  FieldSchema.defaultedArrayOf('classes', [ 'tox-collection__item-label' ], ValueType.string)
];

export const cardTextSchema = ValueSchema.objOf(cardTextFields);

export const createCardText = (spec: CardTextSpec): Result<CardText, ValueSchema.SchemaError<any>> =>
  ValueSchema.asRaw<CardText>('cardtext', cardTextSchema, spec);