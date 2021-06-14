import { FieldProcessor, FieldSchema, ValueSchema, ValueType } from '@ephox/boulder';
import { Result } from '@ephox/katamari';
import { FormComponentWithLabel, formComponentWithLabelFields, FormComponentWithLabelSpec } from './FormComponent';

export interface ImageToolsState {
  blob: Blob;
  url: string;
}

export interface ImageToolsSpec extends FormComponentWithLabelSpec {
  type: 'imagetools';
  currentState: ImageToolsState;
}

export interface ImageTools extends FormComponentWithLabel {
  type: 'imagetools';
  currentState: ImageToolsState;
}

const imageToolsFields: FieldProcessor[] = formComponentWithLabelFields.concat([
  FieldSchema.requiredOf('currentState', ValueSchema.objOf([
    FieldSchema.required('blob'),
    FieldSchema.requiredString('url')
  ]))
]);

export const imageToolsSchema = ValueSchema.objOf(imageToolsFields);

export const imageToolsDataProcessor = ValueType.string;

export const createImageTools = (spec: ImageToolsSpec): Result<ImageTools, ValueSchema.SchemaError<any>> =>
  ValueSchema.asRaw<ImageTools>('imagetools', imageToolsSchema, spec);
