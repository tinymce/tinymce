import { ValueSchema, FieldSchema } from '@ephox/boulder';
import { Result } from '@ephox/katamari';

import { FormComponentWithLabel, FormComponentWithLabelApi, formComponentWithLabelFields } from './FormComponent';

export interface UrlInputApi extends FormComponentWithLabelApi {
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

export const urlInputSchema = ValueSchema.objOf(urlInputFields);

export const urlInputDataProcessor = ValueSchema.objOf([
  FieldSchema.strictString('value'),
  FieldSchema.defaulted('meta', { })
]);

export const createUrlInput = (spec: any): Result<UrlInput, ValueSchema.SchemaError<any>> => ValueSchema.asRaw<UrlInput>('urlinput', urlInputSchema, spec);
