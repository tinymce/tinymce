import { FieldSchema, StructureSchema } from '@ephox/boulder';
import { Optional } from '@ephox/katamari';

import * as ComponentSchema from '../../core/ComponentSchema';

export interface DummySpec {
  type: 'dummy';
  inputLabel?: string;
  buttonIcon?: string;
  buttonText?: string;
  buttonIconPlacement: 'none' | 'left' | 'right';
}

export interface Dummy {
  type: 'dummy';
  inputLabel: Optional<string>;
  buttonIcon: Optional<string>;
  buttonText: Optional<string>;
  buttonIconPlacement: 'none' | 'left' | 'right';
}

export const dummySchema = StructureSchema.objOf([
  ComponentSchema.type,
  FieldSchema.optionString('inputLabel'),
  FieldSchema.optionString('buttonIcon'),
  FieldSchema.optionString('buttonText'),
  FieldSchema.defaultedStringEnum('buttonIconPlacement', 'right', [ 'none', 'left', 'right' ])
]);