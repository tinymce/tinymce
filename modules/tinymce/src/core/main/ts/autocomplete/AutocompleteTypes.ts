/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

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
