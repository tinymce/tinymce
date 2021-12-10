import { FieldSchema, StructureSchema } from '@ephox/boulder';
import { Optional } from '@ephox/katamari';

import { FormComponent, formComponentFields, FormComponentSpec } from './FormComponent';

export interface ImagePanelSpec extends FormComponentSpec {
  type: 'imagepanel';
  width?: string;
  height?: string;
}

export interface ImagePanel extends FormComponent {
  type: 'imagepanel';
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
