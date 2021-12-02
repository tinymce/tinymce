import { FieldPresence, FieldSchema, StructureSchema, ValueType } from '@ephox/boulder';
import { Id, Optional, Result } from '@ephox/katamari';

export interface ButtonSpec {
  type: 'button';
  text: string;
  disabled?: boolean;
  /** @deprecated use `buttonType: "primary" instead */
  primary?: boolean;
  name?: string;
  icon?: string;
  borderless?: boolean;
  buttonType?: 'primary' | 'secondary' | 'toolbar';
}

export interface Button {
  type: 'button';
  text: string;
  disabled: boolean;
  /** @deprecated use `buttonType: "primary" instead */
  primary?: boolean;
  name: string;
  icon: Optional<string>;
  borderless: boolean;
  buttonType: Optional<'primary' | 'secondary' | 'toolbar'>;
}

const buttonFields = [
  FieldSchema.requiredString('type'),
  FieldSchema.requiredString('text'),
  FieldSchema.defaultedBoolean('disabled', false),
  FieldSchema.field(
    'name',
    'name',
    FieldPresence.defaultedThunk(() => Id.generate('button-name')),
    ValueType.string
  ),
  FieldSchema.optionString('icon'),
  FieldSchema.defaultedBoolean('borderless', false),
  // this should be defaulted to `secondary` but the implementation needs to manage the deprecation
  FieldSchema.optionStringEnum('buttonType', [ 'primary', 'secondary', 'toolbar' ]),
  // this should be removed, but must live here because FieldSchema doesn't have a way to manage deprecated fields
  FieldSchema.defaultedBoolean('primary', false),
];

export const buttonSchema = StructureSchema.objOf(buttonFields);

export const createButton = (spec: ButtonSpec): Result<Button, StructureSchema.SchemaError<any>> =>
  StructureSchema.asRaw<Button>('button', buttonSchema, spec);
