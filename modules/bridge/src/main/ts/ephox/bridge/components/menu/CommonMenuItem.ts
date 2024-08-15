import { FieldProcessor, FieldSchema, ValueType } from '@ephox/boulder';
import { Optional } from '@ephox/katamari';

import * as ComponentSchema from '../../core/ComponentSchema';

export interface CommonMenuItemSpec {
  enabled?: boolean;
  text?: string;
  value?: string;
  meta?: Record<string, any>;
  shortcut?: string;
  allowedModes?: string[];
}

export interface CommonMenuItemInstanceApi {
  isEnabled: () => boolean;
  setEnabled: (state: boolean) => void;
}

export interface CommonMenuItem {
  enabled: boolean;
  text: Optional<string>;
  value: string;
  role: Optional<string>;
  meta: Record<string, any>;
  shortcut: Optional<string>;
  allowedModes: string[];
}

export const commonMenuItemFields: FieldProcessor[] = [
  ComponentSchema.enabled,
  ComponentSchema.optionalText,
  ComponentSchema.optionalRole,
  ComponentSchema.optionalShortcut,
  ComponentSchema.generatedValue('menuitem'),
  ComponentSchema.defaultedMeta,
  FieldSchema.defaultedArrayOf('allowedModes', [ 'design' ], ValueType.string)
];
