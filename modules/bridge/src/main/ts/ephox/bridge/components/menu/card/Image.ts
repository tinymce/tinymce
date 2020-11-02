import { FieldSchema, ValueSchema } from '@ephox/boulder';
import { Optional, Result } from '@ephox/katamari';

export interface ImageSpec {
  type: 'image';
  src: string;
  classes?: string[];
  alt?: string;
}

export interface Image {
  type: 'image';
  src: string;
  alt: Optional<string>;
  classes: string[];
}

const imageFields = [
  FieldSchema.strictString('type'),
  FieldSchema.strictString('src'),
  FieldSchema.optionString('alt'),
  FieldSchema.defaultedArrayOf('classes', [], ValueSchema.string)
];

export const imageSchema = ValueSchema.objOf(imageFields);

export const createImage = (spec: ImageSpec): Result<Image, ValueSchema.SchemaError<any>> =>
  ValueSchema.asRaw<Image>('image', imageSchema, spec);