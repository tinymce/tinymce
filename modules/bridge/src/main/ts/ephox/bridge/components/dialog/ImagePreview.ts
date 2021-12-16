import { FieldSchema, StructureSchema } from '@ephox/boulder';
import { Optional } from '@ephox/katamari';

import { FormComponent, formComponentFields, FormComponentSpec } from './FormComponent';

export interface ImagePreviewSpec extends FormComponentSpec {
  type: 'imagepreview';
  width?: string;
  height?: string;
}

export interface ImagePreview extends FormComponent {
  type: 'imagepreview';
  width: Optional<string>;
  height: Optional<string>;
}

export const imagePanelSchema = StructureSchema.objOf(formComponentFields.concat([
  FieldSchema.optionString('width'),
  FieldSchema.optionString('height'),
]));

export const imagePanelDataProcessor = StructureSchema.objOf([
  FieldSchema.requiredString('url'),
  FieldSchema.optionNumber('zoom'),
]);
