import { FieldSchema, StructureSchema, ValueType } from '@ephox/boulder';
import { Result } from '@ephox/katamari';

import * as ComponentSchema from '../../core/ComponentSchema';
import { FormComponent, formComponentFields, FormComponentSpec } from './FormComponent';

export interface CheckboxSpec extends FormComponentSpec {
  type: 'checkbox';
  label: string;
  enabled?: boolean;
  context?: string;
}

export interface Checkbox extends FormComponent {
  type: 'checkbox';
  label: string;
  enabled: boolean;
  context: string;
}

const checkboxFields = formComponentFields.concat([
  ComponentSchema.label,
  ComponentSchema.enabled,
  FieldSchema.defaultedString('context', 'mode:design')
]);

export const checkboxSchema = StructureSchema.objOf(checkboxFields);

export const checkboxDataProcessor = ValueType.boolean;

export const createCheckbox = (spec: CheckboxSpec): Result<Checkbox, StructureSchema.SchemaError<any>> =>
  StructureSchema.asRaw<Checkbox>('checkbox', checkboxSchema, spec);
