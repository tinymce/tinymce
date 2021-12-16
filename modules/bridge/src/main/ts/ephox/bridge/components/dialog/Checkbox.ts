import { StructureSchema, ValueType } from '@ephox/boulder';
import { Result } from '@ephox/katamari';

import * as ComponentSchema from '../../core/ComponentSchema';
import { FormComponent, formComponentFields, FormComponentSpec } from './FormComponent';

export interface CheckboxSpec extends FormComponentSpec {
  type: 'checkbox';
  label: string;
  disabled?: boolean;
}

export interface Checkbox extends FormComponent {
  type: 'checkbox';
  label: string;
  disabled: boolean;
}

const checkboxFields = formComponentFields.concat([
  ComponentSchema.label,
  ComponentSchema.disabled
]);

export const checkboxSchema = StructureSchema.objOf(checkboxFields);

export const checkboxDataProcessor = ValueType.boolean;

export const createCheckbox = (spec: CheckboxSpec): Result<Checkbox, StructureSchema.SchemaError<any>> =>
  StructureSchema.asRaw<Checkbox>('checkbox', checkboxSchema, spec);
