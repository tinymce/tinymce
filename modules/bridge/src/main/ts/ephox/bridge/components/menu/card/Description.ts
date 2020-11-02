import { FieldSchema, ValueSchema } from '@ephox/boulder';
import { Result } from '@ephox/katamari';

export interface DescriptionSpec {
  type: 'description';
  text: string;
  classes?: string[];
}

export interface Description {
  type: 'description';
  text: string;
  classes: string[];
}

const textFields = [
  FieldSchema.strictString('type'),
  FieldSchema.strictString('text'),
  FieldSchema.defaultedArrayOf('classes', [], ValueSchema.string)
];

export const descriptionSchema = ValueSchema.objOf(textFields);

export const createDescription = (spec: DescriptionSpec): Result<Description, ValueSchema.SchemaError<any>> =>
  ValueSchema.asRaw<Description>('description', descriptionSchema, spec);