import { InlineContent } from '@ephox/bridge';

export interface AutocompleteLookupData {
  readonly matchText: string;
  readonly items: InlineContent.AutocompleterContents[];
  readonly columns: InlineContent.ColumnTypes;
  readonly onAction: (autoApi: InlineContent.AutocompleterInstanceApi, rng: Range, value: string, meta: Record<string, any>) => void;
  readonly highlightOn: string[];
}

export interface AutocompleterEventArgs {
  readonly lookupData: AutocompleteLookupData[];
}

export interface AutocompleterReloadArgs {
  readonly fetchOptions?: Record<string, any>;
}
