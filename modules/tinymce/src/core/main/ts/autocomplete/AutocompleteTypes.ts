/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { InlineContent } from '@ephox/bridge';

export interface AutocompleteContext {
  range: Range;
  text: string;
  triggerChar: string;
}

export interface AutocompleteLookupData {
  matchText: string;
  items: InlineContent.AutocompleterContents[];
  columns: InlineContent.ColumnTypes;
  onAction: (autoApi: InlineContent.AutocompleterInstanceApi, rng: Range, value: string, meta: Record<string, any>) => void;
  highlightOn: string[];
}

export interface AutocompleteLookupInfo {
  context: AutocompleteContext;
  lookupData: Promise<AutocompleteLookupData[]>;
}
