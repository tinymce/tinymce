import { FieldSchema, ValueSchema } from '@ephox/boulder';
import { Result } from '@ephox/katamari';

export interface ImageSpec {
  type: 'image';
  src: string;
}

export interface Image {
  type: 'image';
  src: string;
}

const imageFields = [
  FieldSchema.strictString('type'),
  FieldSchema.strictString('src')
];

export const imageSchema = ValueSchema.objOf(imageFields);

export const createImage = (spec: ImageSpec): Result<Image, ValueSchema.SchemaError<any>> =>
  ValueSchema.asRaw<Image>('image', imageSchema, spec);