import { FieldSchema, StructureSchema, ValueType } from '@ephox/boulder';
import type { Optional, Result } from '@ephox/katamari';

import { type FormComponentWithLabel, type FormComponentWithLabelSpec, formComponentWithLabelFields } from './FormComponent';

export interface DropZoneSpec extends FormComponentWithLabelSpec {
  type: 'dropzone';
  context?: string;
  dropAreaLabel?: string;
  buttonLabel?: string;
  allowedFileTypes?: string;
  allowedFileExtensions?: string[];
  onInvalidFiles?: () => void;
}

export interface DropZone extends FormComponentWithLabel {
  type: 'dropzone';
  context: string;
  dropAreaLabel: Optional<string>;
  buttonLabel: Optional<string>;
  allowedFileTypes: Optional<string>;
  allowedFileExtensions: Optional<string[]>;
  onInvalidFiles: Optional<() => void>;
}

const dropZoneFields = formComponentWithLabelFields.concat([
  FieldSchema.defaultedString('context', 'mode:design'),
  FieldSchema.optionString('dropAreaLabel'),
  FieldSchema.optionString('buttonLabel'),
  FieldSchema.optionString('allowedFileTypes'),
  FieldSchema.optionArrayOf('allowedFileExtensions', ValueType.string),
  FieldSchema.optionFunction('onInvalidFiles')
]);

export const dropZoneSchema = StructureSchema.objOf(dropZoneFields);

export const dropZoneDataProcessor = StructureSchema.arrOfVal();

export const createDropZone = (spec: DropZoneSpec): Result<DropZone, StructureSchema.SchemaError<any>> =>
  StructureSchema.asRaw<DropZone>('dropzone', dropZoneSchema, spec);
