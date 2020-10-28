import { FieldSchema, ValueSchema } from '@ephox/boulder';
import { Optional, Result } from '@ephox/katamari';

export interface ImageSpec {
  type: 'image';
  src: string;
  width?: string;
  height?: string;
  alt?: string;
}

export interface Image {
  type: 'image';
  src: string;
  width: Optional<string>;
  height: Optional<string>;
  alt: Optional<string>;
}

const imageFields = [
  FieldSchema.strictString('type'),
  FieldSchema.strictString('src'),
  FieldSchema.optionString('width'),
  FieldSchema.optionString('height'),
  FieldSchema.optionString('alt')
];

export const imageSchema = ValueSchema.objOf(imageFields);

export const createImage = (spec: ImageSpec): Result<Image, ValueSchema.SchemaError<any>> =>
  ValueSchema.asRaw<Image>('image', imageSchema, spec);