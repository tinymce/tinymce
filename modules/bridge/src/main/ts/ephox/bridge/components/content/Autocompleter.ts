import { FieldSchema, ValueSchema } from '@ephox/boulder';
import { Optional, Result } from '@ephox/katamari';

import { SeparatorMenuItem, separatorMenuItemSchema, SeparatorMenuItemSpec } from '../menu/SeparatorMenuItem';

export type ColumnTypes = number | 'auto';
export type SeparatorItemSpec = SeparatorMenuItemSpec;
export interface AutocompleterItemSpec {
  type?: 'autocompleteitem';
  value: string;
  text?: string;
  icon?: string;
  meta?: Record<string, any>;
}

export type AutocompleterContents = SeparatorItemSpec | AutocompleterItemSpec;

export type SeparatorItem = SeparatorMenuItem;
export interface AutocompleterItem {
  type: 'autocompleteitem';
  value: string;
  text: Optional<string>;
  icon: Optional<string>;
  active: boolean;
  disabled: boolean;
  meta: Record<string, any>;
}

export interface AutocompleterSpec {
  type?: 'autocompleter';
  ch: string;
  minChars?: number;
  columns?: ColumnTypes;
  matches?: (rng: Range, text: string, pattern: string) => boolean;
  fetch: (pattern: string, maxResults: number, fetchOptions: Record<string, any>) => Promise<AutocompleterContents[]>;
  onAction: (autocompleterApi: AutocompleterInstanceApi, rng, value: string, meta: Record<string, any>) => void;
  maxResults?: number;
}

export interface AutocompleterInstanceApi {
  hide: () => void;
  reload: (fetchOptions: Record<string, any>) => void;
}

export interface Autocompleter {
  type: 'autocompleter';
  ch: string;
  minChars: number;
  columns: ColumnTypes;
  matches: Optional<(rng: Range, text: string, pattern: string) => boolean>;
  fetch: (pattern: string, maxResults: number, fetchOptions: Record<string, any>) => Promise<AutocompleterContents[]>;
  onAction: (autocompleterApi: AutocompleterInstanceApi, rng, value: string, meta: Record<string, any>) => void;
  maxResults: number;
}

const autocompleterItemSchema = ValueSchema.objOf([
  // Currently, autocomplete items don't support configuring type, active, disabled, meta
  FieldSchema.defaulted('type', 'autocompleteitem'),
  FieldSchema.defaulted('active', false),
  FieldSchema.defaulted('disabled', false),
  FieldSchema.defaulted('meta', {}),
  FieldSchema.strictString('value'),
  FieldSchema.optionString('text'),
  FieldSchema.optionString('icon')
]);

const autocompleterSchema = ValueSchema.objOf([
  FieldSchema.strictString('type'),
  FieldSchema.strictString('ch'),
  FieldSchema.defaultedNumber('minChars', 1),
  FieldSchema.defaulted('columns', 1),
  FieldSchema.defaultedNumber('maxResults', 10),
  FieldSchema.optionFunction('matches'),
  FieldSchema.strictFunction('fetch'),
  FieldSchema.strictFunction('onAction')
]);

export const createSeparatorItem = (spec: SeparatorItemSpec): Result<SeparatorItem, ValueSchema.SchemaError<any>> =>
  ValueSchema.asRaw('Autocompleter.Separator', separatorMenuItemSchema, spec);

export const createAutocompleterItem = (spec: AutocompleterItemSpec): Result<AutocompleterItem, ValueSchema.SchemaError<any>> =>
  ValueSchema.asRaw<AutocompleterItem>('Autocompleter.Item', autocompleterItemSchema, spec);

export const createAutocompleter = (spec: AutocompleterSpec): Result<Autocompleter, ValueSchema.SchemaError<any>> =>
  ValueSchema.asRaw<Autocompleter>('Autocompleter', autocompleterSchema, spec);
