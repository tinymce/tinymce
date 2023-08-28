import { StructureSchema, FieldSchema } from '@ephox/boulder';
import { Optional, Result } from '@ephox/katamari';

import * as ComponentSchema from '../../core/ComponentSchema';
import { FormComponentWithLabel, FormComponentWithLabelSpec, formComponentWithLabelFields } from './FormComponent';

export interface UrlInputSpec extends FormComponentWithLabelSpec {
  type: 'urlinput';
  filetype?: 'image' | 'media' | 'file';
  enabled?: boolean;
  picker_text?: string;
}

export interface UrlInput extends FormComponentWithLabel {
  type: 'urlinput';
  filetype: 'image' | 'media' | 'file';
  enabled: boolean;
  picker_text: Optional<string>;
}

export interface UrlInputData {
  value: string;
  meta: {
    text?: string;
  };
}

const urlInputFields = formComponentWithLabelFields.concat([
  FieldSchema.defaultedStringEnum('filetype', 'file', [ 'image', 'media', 'file' ]),
  ComponentSchema.enabled,
  FieldSchema.optionString('picker_text')
]);

export const urlInputSchema = StructureSchema.objOf(urlInputFields);

export const urlInputDataProcessor = StructureSchema.objOf([
  ComponentSchema.value,
  ComponentSchema.defaultedMeta
]);

export const createUrlInput = (spec: UrlInputSpec): Result<UrlInput, StructureSchema.SchemaError<any>> =>
  StructureSchema.asRaw<UrlInput>('urlinput', urlInputSchema, spec);
