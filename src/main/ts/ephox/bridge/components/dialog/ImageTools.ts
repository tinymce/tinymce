import { ValueSchema, FieldSchema, FieldProcessorAdt } from '@ephox/boulder';
import { Result } from '@ephox/katamari';
import { FormComponent, FormComponentApi, formComponentFields } from './FormComponent';

export interface ImageToolsApi extends FormComponentApi {
  type: 'imagetools';
}

export interface ImageTools extends FormComponent {
  type: 'imagetools';
}

export const imageToolsFields: FieldProcessorAdt[] = formComponentFields.concat([
  FieldSchema.strict('currentState')
]);

export const imageToolsSchema = ValueSchema.objOf(imageToolsFields);

export const imageToolsDataProcessor = ValueSchema.string;

export const createImageTools = (spec: ImageToolsApi): Result<ImageTools, ValueSchema.SchemaError<any>> => {
  return ValueSchema.asRaw<ImageTools>('imagetools', imageToolsSchema, spec);
};
