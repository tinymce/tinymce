import { FieldSchema, StructureSchema, ValueType } from '@ephox/boulder';
import { Fun, type Optional, type Result } from '@ephox/katamari';
import type { SugarElement } from '@ephox/sugar';

import { type FormComponentWithLabel, type FormComponentWithLabelSpec, formComponentWithLabelFields } from './FormComponent';

export interface DropZoneSpec extends FormComponentWithLabelSpec {
  type: 'dropzone';
  context?: string;
  dropAreaLabel?: string;
  buttonLabel?: string;
  allowedFileTypes?: string;
  allowedFileExtensions?: string[];
  onInvalidFiles?: (el: SugarElement<HTMLElement>) => void;
}

export interface DropZone extends FormComponentWithLabel {
  type: 'dropzone';
  context: string;
  dropAreaLabel: Optional<string>;
  buttonLabel: Optional<string>;
  allowedFileTypes: Optional<string>;
  allowedFileExtensions: Optional<string[]>;
  onInvalidFiles: (el: SugarElement<HTMLElement>) => void;
}

const dropZoneFields = formComponentWithLabelFields.concat([
  FieldSchema.defaultedString('context', 'mode:design'),
  FieldSchema.optionString('dropAreaLabel'),
  FieldSchema.optionString('buttonLabel'),
  FieldSchema.optionString('allowedFileTypes'),
  FieldSchema.optionArrayOf('allowedFileExtensions', ValueType.string),
  FieldSchema.defaultedFunction('onInvalidFiles', Fun.noop)
]);

export const dropZoneSchema = StructureSchema.objOf(dropZoneFields);

export const dropZoneDataProcessor = StructureSchema.arrOfVal();

export const createDropZone = (spec: DropZoneSpec): Result<DropZone, StructureSchema.SchemaError<any>> =>
  StructureSchema.asRaw<DropZone>('dropzone', dropZoneSchema, spec);
