import { ValueSchema, FieldSchema, FieldProcessorAdt } from '@ephox/boulder';
import { Result } from '@ephox/katamari';
import { FormComponentWithLabel, FormComponentWithLabelApi, formComponentWithLabelFields } from './FormComponent';
import { Blob } from '@ephox/dom-globals';

export interface ImageToolsState {
  blob: Blob;
  url: string;
}

export interface ImageToolsApi extends FormComponentWithLabelApi {
  type: 'imagetools';
  currentState: ImageToolsState;
}

export interface ImageTools extends FormComponentWithLabel {
  type: 'imagetools';
  currentState: ImageToolsState;
}

const imageToolsFields: FieldProcessorAdt[] = formComponentWithLabelFields.concat([
  FieldSchema.strictOf('currentState', ValueSchema.objOf([
    FieldSchema.strict('blob'),
    FieldSchema.strictString('url')
  ]))
]);

export const imageToolsSchema = ValueSchema.objOf(imageToolsFields);

export const imageToolsDataProcessor = ValueSchema.string;

export const createImageTools = (spec: ImageToolsApi): Result<ImageTools, ValueSchema.SchemaError<any>> => {
  return ValueSchema.asRaw<ImageTools>('imagetools', imageToolsSchema, spec);
};
