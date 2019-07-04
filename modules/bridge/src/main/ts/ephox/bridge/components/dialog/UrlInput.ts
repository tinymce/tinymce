import { ValueSchema, FieldSchema } from '@ephox/boulder';
import { Result } from '@ephox/katamari';

import { FormComponentWithLabel, FormComponentWithLabelApi, formComponentWithLabelFields } from './FormComponent';

export interface UrlInputApi extends FormComponentWithLabelApi {
  type: 'urlinput';
  filetype?: 'image' | 'media' | 'file';
}

export interface UrlInput extends FormComponentWithLabel {
  type: 'urlinput';
  filetype: 'image' | 'media' | 'file';
}

export const urlInputFields = formComponentWithLabelFields.concat([
  FieldSchema.defaultedStringEnum('filetype', 'file', ['image', 'media', 'file'])
]);

export const urlInputSchema = ValueSchema.objOf(urlInputFields);

export const urlInputDataProcessor = ValueSchema.objOf([
  FieldSchema.strictString('value'),
  FieldSchema.defaulted('meta', { })
]);

export const createUrlInput = (spec: any): Result<UrlInput, ValueSchema.SchemaError<any>> => {
  return ValueSchema.asRaw<UrlInput>('urlinput', urlInputSchema, spec);
};
