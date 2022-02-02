import { FieldPresence, FieldProcessor, FieldSchema, ValueType } from '@ephox/boulder';
import { Id, Optional } from '@ephox/katamari';

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
  FieldSchema.defaultedBoolean('disabled', false),
  FieldSchema.optionString('text'),
  FieldSchema.optionString('shortcut'),
  FieldSchema.field(
    'value',
    'value',
    FieldPresence.defaultedThunk(() => Id.generate('menuitem-value')),
    ValueType.anyValue()
  ),
  FieldSchema.defaulted('meta', { })
];
