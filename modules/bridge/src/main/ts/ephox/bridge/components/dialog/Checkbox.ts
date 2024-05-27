import { FieldSchema, StructureSchema, ValueType } from '@ephox/boulder';
import { Optional, Result } from '@ephox/katamari';

import * as ComponentSchema from '../../core/ComponentSchema';
import { FormComponent, formComponentFields, FormComponentSpec } from './FormComponent';

export interface CheckboxSpec extends FormComponentSpec {
  type: 'checkbox';
  label: string;
  enabled?: boolean;
  id?: string;
}

export interface Checkbox extends FormComponent {
  type: 'checkbox';
  label: string;
  enabled: boolean;
  id: Optional<string>;
}

const checkboxFields = formComponentFields.concat([
  ComponentSchema.label,
  ComponentSchema.enabled,
  FieldSchema.optionString('id'),
]);

export const checkboxSchema = StructureSchema.objOf(checkboxFields);

export const checkboxDataProcessor = ValueType.boolean;

export const createCheckbox = (spec: CheckboxSpec): Result<Checkbox, StructureSchema.SchemaError<any>> =>
  StructureSchema.asRaw<Checkbox>('checkbox', checkboxSchema, spec);
