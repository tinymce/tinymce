import { FieldProcessor } from '@ephox/boulder';
import { Optional } from '@ephox/katamari';

import * as ComponentSchema from '../../core/ComponentSchema';

export interface CommonMenuItemSpec {
  enabled?: boolean;
  enabled_in_readonly?: boolean;
  text?: string;
  value?: string;
  meta?: Record<string, any>;
  shortcut?: string;
}

export interface CommonMenuItemInstanceApi {
  isEnabled: () => boolean;
  setEnabled: (state: boolean) => void;
}

export interface CommonMenuItem {
  enabled: boolean;
  enabled_in_readonly: boolean;
  text: Optional<string>;
  value: string;
  meta: Record<string, any>;
  shortcut: Optional<string>;
}

export const commonMenuItemFields: FieldProcessor[] = [
  ComponentSchema.enabled,
  ComponentSchema.enabledInReadOnly,
  ComponentSchema.optionalText,
  ComponentSchema.optionalShortcut,
  ComponentSchema.generatedValue('menuitem'),
  ComponentSchema.defaultedMeta
];
