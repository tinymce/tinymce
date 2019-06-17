import { ValueSchema } from '@ephox/boulder';
import { Result } from '@ephox/katamari';
import { FormComponent, FormComponentApi, formComponentFields } from './FormComponent';

export interface DropZoneApi extends FormComponentApi {
  type: 'dropzone';
}

export interface DropZone extends FormComponent {
  type: 'dropzone';
}

export const dropZoneFields = formComponentFields;

export const dropZoneSchema = ValueSchema.objOf(dropZoneFields);

export const dropZoneDataProcessor = ValueSchema.arrOfVal();

export const createDropZone = (spec: DropZoneApi): Result<DropZone, ValueSchema.SchemaError<any>> => {
  return ValueSchema.asRaw<DropZone>('dropzone', dropZoneSchema, spec);
};
