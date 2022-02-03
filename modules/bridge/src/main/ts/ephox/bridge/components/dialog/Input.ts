import { FieldSchema, StructureSchema, ValueType } from '@ephox/boulder';
import { Optional, Result } from '@ephox/katamari';

import * as ComponentSchema from '../../core/ComponentSchema';
import { FormComponentWithLabel, formComponentWithLabelFields, FormComponentWithLabelSpec } from './FormComponent';

export interface InputSpec extends FormComponentWithLabelSpec {
  type: 'input';
  inputMode?: string;
  placeholder?: string;
  maximized?: boolean;
  enabled?: boolean;
}

export interface Input extends FormComponentWithLabel {
  type: 'input';
  inputMode: Optional<string>;
  placeholder: Optional<string>;
  maximized: boolean;
  enabled: boolean;
}

const inputFields = formComponentWithLabelFields.concat([
  FieldSchema.optionString('inputMode'),
  FieldSchema.optionString('placeholder'),
  FieldSchema.defaultedBoolean('maximized', false),
  ComponentSchema.enabled
]);

export const inputSchema = StructureSchema.objOf(inputFields);

export const inputDataProcessor = ValueType.string;

export const createInput = (spec: InputSpec): Result<Input, StructureSchema.SchemaError<any>> =>
  StructureSchema.asRaw<Input>('input', inputSchema, spec);
