/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { AutocompleteContext } from './AutocompleteContext';
import { AutocompleteLookupData } from './AutocompleteLookup';

export interface AutocompleteReloadEventArgs {
  fetchOptions: Record<string, any>;
}

export interface AutocompleteEventArgs {
  context: AutocompleteContext;
  lookupData: AutocompleteLookupData[];
}
