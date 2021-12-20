import { FieldProcessor } from '@ephox/boulder';
import { Optional } from '@ephox/katamari';

import * as ComponentSchema from '../../core/ComponentSchema';

export interface CommonMenuItemSpec {
  disabled?: boolean;
  text?: string;
  value?: string;
  meta?: Record<string, any>;
  shortcut?: string;
}

export interface CommonMenuItemInstanceApi {
  isDisabled: () => boolean;
  setDisabled: (state: boolean) => void;
}

export interface CommonMenuItem {
  disabled: boolean;
  text: Optional<string>;
  value: string;
  meta: Record<string, any>;
  shortcut: Optional<string>;
}

export const commonMenuItemFields: FieldProcessor[] = [
  ComponentSchema.disabled,
  ComponentSchema.optionalText,
  ComponentSchema.optionalShortcut,
  ComponentSchema.generatedValue('menuitem'),
  ComponentSchema.defaultedMeta
];
