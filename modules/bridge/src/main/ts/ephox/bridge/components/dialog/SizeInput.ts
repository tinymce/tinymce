import { StructureSchema, FieldSchema, ValueType } from '@ephox/boulder';
import type { Optional, Result } from '@ephox/katamari';

import * as ComponentSchema from '../../core/ComponentSchema';

import { type FormComponentWithLabel, type FormComponentWithLabelSpec, formComponentWithLabelFields } from './FormComponent';

export type SizeInputRatio = number | (() => number | undefined);

export interface SizeInputSpec extends FormComponentWithLabelSpec {
  type: 'sizeinput';
  constrain?: boolean;
  enabled?: boolean;
  context?: string;
  /**
   * The width divided by the height, used to keep proportions when constrain is on and the user
   * types into a blank field while the other field has a pixel value. A function is called each
   * time a size field gets focus, so the ratio can change while the dialog is open. Return
   * undefined when there's no ratio.
   */
  ratio?: SizeInputRatio;
}

export interface SizeInput extends FormComponentWithLabel {
  type: 'sizeinput';
  constrain: boolean;
  enabled: boolean;
  context: string;
  ratio: Optional<SizeInputRatio>;
}

const sizeInputFields = formComponentWithLabelFields.concat([
  FieldSchema.defaultedBoolean('constrain', true),
  ComponentSchema.enabled,
  FieldSchema.defaultedString('context', 'mode:design'),
  FieldSchema.optionOf('ratio', StructureSchema.oneOf([ ValueType.number, ValueType.func ]))
]);

export const sizeInputSchema = StructureSchema.objOf(sizeInputFields);

export const sizeInputDataProcessor = StructureSchema.objOf([
  FieldSchema.requiredString('width'),
  FieldSchema.requiredString('height')
]);

export const createSizeInput = (spec: SizeInputSpec): Result<SizeInput, StructureSchema.SchemaError<any>> =>
  StructureSchema.asRaw<SizeInput>('sizeinput', sizeInputSchema, spec);
