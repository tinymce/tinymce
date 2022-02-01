import { FieldPresence, FieldProcessor, FieldSchema, ValueType } from '@ephox/boulder';
import { Fun, Id } from '@ephox/katamari';

export const type = FieldSchema.requiredString('type');
export const name = FieldSchema.requiredString('name');
export const label = FieldSchema.requiredString('label');
export const text = FieldSchema.requiredString('text');
export const title = FieldSchema.requiredString('title');
export const icon = FieldSchema.requiredString('icon');
export const value = FieldSchema.requiredString('value');
export const fetch = FieldSchema.requiredFunction('fetch');
export const getSubmenuItems = FieldSchema.requiredFunction('getSubmenuItems');
export const onAction = FieldSchema.requiredFunction('onAction');
export const onItemAction = FieldSchema.requiredFunction('onItemAction');
export const onSetup = FieldSchema.defaultedFunction('onSetup', () => Fun.noop);

export const optionalName = FieldSchema.optionString('name');
export const optionalText = FieldSchema.optionString('text');
export const optionalIcon = FieldSchema.optionString('icon');
export const optionalTooltip = FieldSchema.optionString('tooltip');
export const optionalLabel = FieldSchema.optionString('label');
export const optionalShortcut = FieldSchema.optionString('shortcut');
export const optionalSelect = FieldSchema.optionFunction('select');

export const active = FieldSchema.defaultedBoolean('active', false);
export const borderless = FieldSchema.defaultedBoolean('borderless', false);
export const enabled = FieldSchema.defaultedBoolean('enabled', true);
export const primary = FieldSchema.defaultedBoolean('primary', false);
export const defaultedColumns = (num: number | 'auto'): FieldProcessor => FieldSchema.defaulted('columns', num);
export const defaultedMeta = FieldSchema.defaulted('meta', {});
export const defaultedOnAction = FieldSchema.defaultedFunction('onAction', Fun.noop);
export const defaultedType = (type: string): FieldProcessor => FieldSchema.defaultedString('type', type);

export const generatedName = (namePrefix: string): FieldProcessor =>
  FieldSchema.field(
    'name',
    'name',
    FieldPresence.defaultedThunk(() => Id.generate(`${namePrefix}-name`)),
    ValueType.string
  );

export const generatedValue = (valuePrefix: string): FieldProcessor =>
  FieldSchema.field(
    'value',
    'value',
    FieldPresence.defaultedThunk(() => Id.generate(`${valuePrefix}-value`)),
    ValueType.anyValue()
  );
