import { FieldSchema, StructureSchema, ValueType } from '@ephox/boulder';
import { Optional, Result } from '@ephox/katamari';

import * as ComponentSchema from '../../core/ComponentSchema';
import { CardMenuItemSpec } from '../menu/CardMenuItem';
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

export type AutocompleterContents = SeparatorItemSpec | AutocompleterItemSpec | CardMenuItemSpec;

export type SeparatorItem = SeparatorMenuItem;
export interface AutocompleterItem {
  type: 'autocompleteitem';
  value: string;
  text: Optional<string>;
  icon: Optional<string>;
  active: boolean;
  enabled: boolean;
  meta: Record<string, any>;
}

export interface AutocompleterSpec {
  type?: 'autocompleter';
  // TODO: TINY-8929: Remove 'trigger' fallback to 'ch'
  ch?: string;
  trigger?: string;
  minChars?: number;
  columns?: ColumnTypes;
  matches?: (rng: Range, text: string, pattern: string) => boolean;
  fetch: (pattern: string, maxResults: number, fetchOptions: Record<string, any>) => Promise<AutocompleterContents[]>;
  onAction: (autocompleterApi: AutocompleterInstanceApi, rng: Range, value: string, meta: Record<string, any>) => void;
  maxResults?: number;
  highlightOn?: string[];
}

export interface AutocompleterInstanceApi {
  hide: () => void;
  reload: (fetchOptions: Record<string, any>) => void;
}

export interface Autocompleter {
  type: 'autocompleter';
  trigger: string;
  minChars: number;
  columns: ColumnTypes;
  matches: Optional<(rng: Range, text: string, pattern: string) => boolean>;
  fetch: (pattern: string, maxResults: number, fetchOptions: Record<string, any>) => Promise<AutocompleterContents[]>;
  onAction: (autocompleterApi: AutocompleterInstanceApi, rng: Range, value: string, meta: Record<string, any>) => void;
  maxResults: number;
  highlightOn: string[];
}

const autocompleterItemSchema = StructureSchema.objOf([
  // Currently, autocomplete items don't support configuring type, active, disabled, meta
  ComponentSchema.defaultedType('autocompleteitem'),
  ComponentSchema.active,
  ComponentSchema.enabled,
  ComponentSchema.defaultedMeta,
  ComponentSchema.value,
  ComponentSchema.optionalText,
  ComponentSchema.optionalIcon
]);

const autocompleterSchema = StructureSchema.objOf([
  ComponentSchema.type,
  FieldSchema.requiredString('trigger'),
  FieldSchema.defaultedNumber('minChars', 1),
  ComponentSchema.defaultedColumns(1),
  FieldSchema.defaultedNumber('maxResults', 10),
  FieldSchema.optionFunction('matches'),
  ComponentSchema.fetch,
  ComponentSchema.onAction,
  FieldSchema.defaultedArrayOf('highlightOn', [], ValueType.string)
]);

export const createSeparatorItem = (spec: SeparatorItemSpec): Result<SeparatorItem, StructureSchema.SchemaError<any>> =>
  StructureSchema.asRaw('Autocompleter.Separator', separatorMenuItemSchema, spec);

export const createAutocompleterItem = (spec: AutocompleterItemSpec): Result<AutocompleterItem, StructureSchema.SchemaError<any>> =>
  StructureSchema.asRaw<AutocompleterItem>('Autocompleter.Item', autocompleterItemSchema, spec);

export const createAutocompleter = (spec: AutocompleterSpec): Result<Autocompleter, StructureSchema.SchemaError<any>> =>
  // TODO: TINY-8929: Remove 'trigger' fallback to 'ch'
  StructureSchema.asRaw<Autocompleter>('Autocompleter', autocompleterSchema, { trigger: spec.ch, ...spec });
