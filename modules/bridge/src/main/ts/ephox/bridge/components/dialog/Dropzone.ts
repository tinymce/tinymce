import { FieldSchema, StructureSchema } from '@ephox/boulder';
import { Result } from '@ephox/katamari';

import { FormComponentWithLabel, FormComponentWithLabelSpec, formComponentWithLabelFields } from './FormComponent';

export interface DropZonePicker {
  icon: string;
  tooltip: string;
  onPick: (callback: (url: string) => void) => void;
}

export interface DropZoneSpec extends FormComponentWithLabelSpec {
  type: 'dropzone';
  pickers?: DropZonePicker[];
}

export interface DropZone extends FormComponentWithLabel {
  type: 'dropzone';
  pickers: DropZonePicker[];
}

export const dropZonePickerSchema = StructureSchema.objOf([
  FieldSchema.requiredString('icon'),
  FieldSchema.requiredString('tooltip'),
  FieldSchema.requiredFunction('onPick'),
]);

const dropZoneFields = [
  ...formComponentWithLabelFields,
  FieldSchema.defaultedArrayOf('pickers', [], dropZonePickerSchema)
];

export const dropZoneSchema = StructureSchema.objOf(dropZoneFields);

export const dropZoneDataProcessor = StructureSchema.arrOfVal();

export const createDropZone = (spec: DropZoneSpec): Result<DropZone, StructureSchema.SchemaError<any>> =>
  StructureSchema.asRaw<DropZone>('dropzone', dropZoneSchema, spec);
