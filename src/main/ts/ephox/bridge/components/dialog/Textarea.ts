import { ValueSchema, FieldSchema } from '@ephox/boulder';
import { Result } from '@ephox/katamari';
import { FormComponent, FormComponentApi, formComponentFields } from './FormComponent';

export interface TextAreaApi extends FormComponentApi {
  type: 'textarea';
  flex?: boolean;
}

export interface TextArea extends FormComponent {
  type: 'textarea';
  flex: boolean;
}

export const textAreaFields = formComponentFields.concat([
  FieldSchema.defaulted('flex', false)
]);

export const textAreaSchema = ValueSchema.objOf(textAreaFields);

export const textAreaDataProcessor = ValueSchema.string;

export const createTextArea = (spec: TextAreaApi): Result<TextArea, ValueSchema.SchemaError<any>> => {
  return ValueSchema.asRaw<TextArea>('textarea', textAreaSchema, spec);
};
