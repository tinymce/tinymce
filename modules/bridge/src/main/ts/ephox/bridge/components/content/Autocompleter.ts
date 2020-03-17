import { FieldSchema, ValueSchema } from '@ephox/boulder';
import { Range } from '@ephox/dom-globals';
import { Option, Result } from '@ephox/katamari';

import { SeparatorMenuItem, SeparatorMenuItemApi, separatorMenuItemSchema } from '../menu/SeparatorMenuItem';
import { ColumnTypes } from '../toolbar/ToolbarSplitButton';

export type SeparatorItemApi = SeparatorMenuItemApi;
export interface AutocompleterItemApi {
  type?: 'autocompleteitem';
  value: string;
  text?: string;
  icon?: string;
  meta?: Record<string, any>;
}

export type AutocompleterContents = SeparatorItemApi | AutocompleterItemApi;

export type SeparatorItem = SeparatorMenuItem;
export interface AutocompleterItem {
  type: 'autocompleteitem';
  value: string;
  text: Option<string>;
  icon: Option<string>;
  active: boolean;
  disabled: boolean;
  meta: Record<string, any>;
}

export interface AutocompleterApi {
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
  matches: Option<(rng: Range, text: string, pattern: string) => boolean>;
  fetch: (pattern: string, maxResults: number, fetchOptions: Record<string, any>) => Promise<AutocompleterContents[]>;
  onAction: (autocompleterApi: AutocompleterInstanceApi, rng, value: string, meta: Record<string, any>) => void;
  maxResults: number;
}

const autocompleterItemSchema = ValueSchema.objOf([
  // Currently, autocomplete items don't support configuring type, active, disabled, meta
  FieldSchema.state('type', () => 'autocompleteitem'),
  FieldSchema.state('active', () => false),
  FieldSchema.state('disabled', () => false),
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

export const createSeparatorItem = (spec: SeparatorItemApi): Result<SeparatorItem, ValueSchema.SchemaError<any>> => ValueSchema.asRaw('Autocompleter.Separator', separatorMenuItemSchema, spec);

export const createAutocompleterItem = (spec: AutocompleterItemApi): Result<AutocompleterItem, ValueSchema.SchemaError<any>> => ValueSchema.asRaw<AutocompleterItem>('Autocompleter.Item', autocompleterItemSchema, spec);

export const createAutocompleter = (spec: AutocompleterApi): Result<Autocompleter, ValueSchema.SchemaError<any>> => ValueSchema.asRaw<Autocompleter>('Autocompleter', autocompleterSchema, spec);
