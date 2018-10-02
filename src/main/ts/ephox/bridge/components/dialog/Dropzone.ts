import { ValueSchema, FieldSchema } from '@ephox/boulder';
import { Result } from '@ephox/katamari';
import { FormComponent, FormComponentApi, formComponentFields } from './FormComponent';

export interface DropZoneApi extends FormComponentApi {
  type: 'dropzone';
  flex?: boolean;
}

export interface DropZone extends FormComponent {
  type: 'dropzone';
  flex: boolean;
}

export const dropZoneFields = formComponentFields.concat([
  FieldSchema.defaulted('flex', false)
]);

export const dropZoneSchema = ValueSchema.objOf(dropZoneFields);

export const dropZoneDataProcessor = ValueSchema.arrOfVal();

export const createDropZone = (spec: DropZoneApi): Result<DropZone, ValueSchema.SchemaError<any>> => {
  return ValueSchema.asRaw<DropZone>('dropzone', dropZoneSchema, spec);
};
