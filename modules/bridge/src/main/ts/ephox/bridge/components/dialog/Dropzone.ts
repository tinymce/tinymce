import { FieldSchema, StructureSchema } from '@ephox/boulder';
import type { Optional, Result } from '@ephox/katamari';

import { type FormComponentWithLabel, type FormComponentWithLabelSpec, formComponentWithLabelFields } from './FormComponent';

export interface DropZoneSpec extends FormComponentWithLabelSpec {
  type: 'dropzone';
  context?: string;
  dropAreaLabel?: string;
  buttonLabel?: string;
  allowedFiles?: string;
}

export interface DropZone extends FormComponentWithLabel {
  type: 'dropzone';
  context: string;
  dropAreaLabel: Optional<string>;
  buttonLabel: Optional<string>;
  allowedFiles: Optional<string>;
}

const dropZoneFields = formComponentWithLabelFields.concat([
  FieldSchema.defaultedString('context', 'mode:design'),
  FieldSchema.optionString('dropAreaLabel'),
  FieldSchema.optionString('buttonLabel'),
  FieldSchema.optionString('allowedFiles')
]);

export const dropZoneSchema = StructureSchema.objOf(dropZoneFields);

export const dropZoneDataProcessor = StructureSchema.arrOfVal();

export const createDropZone = (spec: DropZoneSpec): Result<DropZone, StructureSchema.SchemaError<any>> =>
  StructureSchema.asRaw<DropZone>('dropzone', dropZoneSchema, spec);
