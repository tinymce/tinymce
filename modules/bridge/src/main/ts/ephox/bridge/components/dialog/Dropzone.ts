import { ValueSchema } from '@ephox/boulder';
import { Result } from '@ephox/katamari';
import { FormComponentWithLabel, FormComponentWithLabelApi, formComponentWithLabelFields } from './FormComponent';

export interface DropZoneApi extends FormComponentWithLabelApi {
  type: 'dropzone';
}

export interface DropZone extends FormComponentWithLabel {
  type: 'dropzone';
}

const dropZoneFields = formComponentWithLabelFields;

export const dropZoneSchema = ValueSchema.objOf(dropZoneFields);

export const dropZoneDataProcessor = ValueSchema.arrOfVal();

export const createDropZone = (spec: DropZoneApi): Result<DropZone, ValueSchema.SchemaError<any>> => ValueSchema.asRaw<DropZone>('dropzone', dropZoneSchema, spec);
