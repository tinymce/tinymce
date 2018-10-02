import { FieldPresence, FieldProcessorAdt, FieldSchema, ValueSchema } from '@ephox/boulder';
import { Id, Option } from '@ephox/katamari';

export interface CommonMenuItemApi {
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
  text: Option<string>;
  value: string;
  meta: Record<string, any>;
  shortcut: Option<string>;
}

export const commonMenuItemFields: FieldProcessorAdt[] = [
  FieldSchema.defaultedBoolean('disabled', false),
  FieldSchema.optionString('text'),
  FieldSchema.optionString('shortcut'),
  FieldSchema.field(
    'value',
    'value',
    FieldPresence.defaultedThunk(() => {
      return Id.generate('menuitem-value');
    }),
    ValueSchema.anyValue()
  ),
  FieldSchema.defaulted('meta', { })
];