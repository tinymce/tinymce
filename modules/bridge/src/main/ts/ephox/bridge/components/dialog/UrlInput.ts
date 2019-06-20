import { ValueSchema, FieldSchema } from '@ephox/boulder';
import { Result } from '@ephox/katamari';

import { FormComponent, FormComponentApi, formComponentFields } from './FormComponent';

export interface UrlInputApi extends FormComponentApi {
  type: 'urlinput';
  filetype?: 'image' | 'media' | 'file';
}

export interface UrlInput extends FormComponent {
  type: 'urlinput';
  filetype: 'image' | 'media' | 'file';
}

export const urlInputFields = formComponentFields.concat([
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
