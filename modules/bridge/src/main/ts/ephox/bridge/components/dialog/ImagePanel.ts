import { FieldSchema, StructureSchema } from '@ephox/boulder';

import { FormComponent, formComponentFields, FormComponentSpec } from './FormComponent';

export interface ImagePanelSpec extends FormComponentSpec {
  type: 'imagepanel';
}

export interface ImagePanel extends FormComponent {
  type: 'imagepanel';
}

export const imagePanelSchema = StructureSchema.objOf(formComponentFields);

export const imagePanelDataProcessor = StructureSchema.objOf([
  FieldSchema.requiredString('url'),
  FieldSchema.requiredNumber('width'),
  FieldSchema.requiredNumber('height'),
]);
