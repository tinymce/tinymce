import { FieldSchema, ValueSchema } from '@ephox/boulder';
import { Optional, Result } from '@ephox/katamari';

export interface TitleSpec {
  type: 'title';
  text: string;
  name?: string;
}

export interface Title {
  type: 'title';
  text: string;
  name: Optional<string>;
}

const titleFields = [
  FieldSchema.strictString('type'),
  FieldSchema.strictString('text'),
  FieldSchema.optionString('name')
];

export const titleSchema = ValueSchema.objOf(titleFields);

export const createTitle = (spec: TitleSpec): Result<Title, ValueSchema.SchemaError<any>> =>
  ValueSchema.asRaw<Title>('title', titleSchema, spec);