import { FieldSchema, StructureSchema } from '@ephox/boulder';
import { Optional } from '@ephox/katamari';

import { FormComponent, formComponentFields, FormComponentSpec } from './FormComponent';

export interface ImagePreviewSpec extends FormComponentSpec {
  type: 'imagepreview';
  height?: string;
}

export interface ImagePreview extends FormComponent {
  type: 'imagepreview';
  height: Optional<string>;
}

export interface ImagePreviewData {
  url: string;
  zoom?: number;
  cachedHeight?: number;
  cachedWidth?: number;
}

export const imagePreviewSchema = StructureSchema.objOf(formComponentFields.concat([
  FieldSchema.optionString('height'),
]));

export const imagePreviewDataProcessor = StructureSchema.objOf([
  FieldSchema.requiredString('url'),
  FieldSchema.optionNumber('zoom'),
  FieldSchema.optionNumber('cachedWidth'),
  FieldSchema.optionNumber('cachedHeight'),
]);
