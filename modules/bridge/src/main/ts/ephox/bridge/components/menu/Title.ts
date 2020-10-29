import { FieldSchema, ValueSchema } from '@ephox/boulder';
import { Result } from '@ephox/katamari';

export interface TitleSpec {
  type: 'title';
  text: string;
}

export interface Title {
  type: 'title';
  text: string;
}

const titleFields = [
  FieldSchema.strictString('type'),
  FieldSchema.strictString('text')
];

export const titleSchema = ValueSchema.objOf(titleFields);

export const createTitle = (spec: TitleSpec): Result<Title, ValueSchema.SchemaError<any>> =>
  ValueSchema.asRaw<Title>('title', titleSchema, spec);