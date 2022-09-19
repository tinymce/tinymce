import { FieldSchema, StructureSchema } from '@ephox/boulder';
import { Result } from '@ephox/katamari';

import * as ComponentSchema from '../../core/ComponentSchema';

export interface ViewNormalButtonSpec {
  type: 'button';
  text: string;
  buttonType?: 'primary' | 'secondary';
  onAction: () => void;
}

export type ViewButtonSpec = ViewNormalButtonSpec;

export interface ViewNormalButton {
  type: 'button';
  text: string;
  buttonType: 'primary' | 'secondary';
  onAction: () => void;
}

export type ViewButton = ViewNormalButton;

const normalButtonFields = [
  FieldSchema.requiredStringEnum('type', [ 'button' ]),
  ComponentSchema.text,
  FieldSchema.defaultedStringEnum('buttonType', 'secondary', [ 'primary', 'secondary' ]),
  FieldSchema.requiredFunction('onAction')
];

export const viewButtonSchema = StructureSchema.choose(
  'type',
  {
    submit: normalButtonFields,
    cancel: normalButtonFields
  }
);

export const createViewButton = (spec: ViewButtonSpec): Result<ViewButton, StructureSchema.SchemaError<any>> =>
  StructureSchema.asRaw<ViewButton>('viewbutton', viewButtonSchema, spec);
