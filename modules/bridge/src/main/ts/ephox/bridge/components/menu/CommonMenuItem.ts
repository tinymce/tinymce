import { FieldProcessor, FieldSchema } from '@ephox/boulder';
import { Optional } from '@ephox/katamari';

import * as ComponentSchema from '../../core/ComponentSchema';

export interface CommonMenuItemSpec {
  enabled?: boolean;
  text?: string;
  value?: string;
  meta?: Record<string, any>;
  shortcut?: string;
  readonly?: boolean;
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
  readonly: boolean;
}

export const commonMenuItemFields: FieldProcessor[] = [
  ComponentSchema.enabled,
  ComponentSchema.optionalText,
  ComponentSchema.optionalRole,
  ComponentSchema.optionalShortcut,
  ComponentSchema.generatedValue('menuitem'),
  ComponentSchema.defaultedMeta,
  FieldSchema.defaultedBoolean('readonly', false)
];
