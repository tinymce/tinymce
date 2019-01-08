import { ValueSchema, FieldSchema } from '@ephox/boulder';
import { Option, Result } from '@ephox/katamari';
import { FormComponent, FormComponentApi, formComponentFields } from './FormComponent';

export interface TextAreaApi extends FormComponentApi {
  type: 'textarea';
  placeholder?: string;
}

export interface TextArea extends FormComponent {
  type: 'textarea';
  placeholder?: Option<string>;
}

export const textAreaFields = formComponentFields.concat([
  FieldSchema.optionString('placeholder')
]);

export const textAreaSchema = ValueSchema.objOf(textAreaFields);

export const textAreaDataProcessor = ValueSchema.string;

export const createTextArea = (spec: TextAreaApi): Result<TextArea, ValueSchema.SchemaError<any>> => {
  return ValueSchema.asRaw<TextArea>('textarea', textAreaSchema, spec);
};
