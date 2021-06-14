import { StructureSchema, FieldSchema } from '@ephox/boulder';
import { Result } from '@ephox/katamari';

import { FormComponentWithLabel, FormComponentWithLabelSpec, formComponentWithLabelFields } from './FormComponent';

export interface UrlInputSpec extends FormComponentWithLabelSpec {
  type: 'urlinput';
  filetype?: 'image' | 'media' | 'file';
  disabled?: boolean;
}

export interface UrlInput extends FormComponentWithLabel {
  type: 'urlinput';
  filetype: 'image' | 'media' | 'file';
  disabled: boolean;
}

const urlInputFields = formComponentWithLabelFields.concat([
  FieldSchema.defaultedStringEnum('filetype', 'file', [ 'image', 'media', 'file' ]),
  FieldSchema.defaulted('disabled', false)
]);

export const urlInputSchema = StructureSchema.objOf(urlInputFields);

export const urlInputDataProcessor = StructureSchema.objOf([
  FieldSchema.requiredString('value'),
  FieldSchema.defaulted('meta', { })
]);

export const createUrlInput = (spec: UrlInputSpec): Result<UrlInput, StructureSchema.SchemaError<any>> =>
  StructureSchema.asRaw<UrlInput>('urlinput', urlInputSchema, spec);
