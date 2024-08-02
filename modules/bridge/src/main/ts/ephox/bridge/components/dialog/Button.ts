import { FieldSchema, StructureSchema } from '@ephox/boulder';
import { Optional, Result } from '@ephox/katamari';

import * as ComponentSchema from '../../core/ComponentSchema';

export interface ButtonSpec {
  type: 'button';
  text: string;
  enabled?: boolean;
  /** @deprecated use `buttonType: "primary"` instead */
  primary?: boolean;
  name?: string;
  icon?: string;
  borderless?: boolean;
  buttonType?: 'primary' | 'secondary' | 'toolbar';
}

export interface Button {
  type: 'button';
  text: string;
  enabled: boolean;
  /** @deprecated use `buttonType: "primary"` instead */
  primary: boolean;
  name: string;
  icon: Optional<string>;
  borderless: boolean;
  buttonType: Optional<'primary' | 'secondary' | 'toolbar'>;
}

const buttonFields = [
  ComponentSchema.type,
  ComponentSchema.text,
  ComponentSchema.enabled,
  ComponentSchema.generatedName('button'),
  ComponentSchema.optionalIcon,
  ComponentSchema.borderless,
  // this should be defaulted to `secondary` but the implementation needs to manage the deprecation
  FieldSchema.optionStringEnum('buttonType', [ 'primary', 'secondary', 'toolbar' ]),
  // this should be removed, but must live here because FieldSchema doesn't have a way to manage deprecated fields
  ComponentSchema.primary,
];

export const buttonSchema = StructureSchema.objOf(buttonFields);

export const createButton = (spec: ButtonSpec): Result<Button, StructureSchema.SchemaError<any>> =>
  StructureSchema.asRaw<Button>('button', buttonSchema, spec);
