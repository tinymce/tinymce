/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { renderAutocompleteItem } from './build/AutocompleteMenuItem';
import { renderChoiceItem } from './build/ChoiceItem';
import { renderFancyMenuItem } from './build/FancyMenuItem';
import { renderNormalItem } from './build/NormalMenuItem';
import { renderNestedItem } from './build/NestedMenuItem';
import { renderSeparatorItem } from './build/SeparatorItem';
import { renderToggleMenuItem } from './build/ToggleMenuItem';

const choice = renderChoiceItem;
const autocomplete = renderAutocompleteItem;
const separator = renderSeparatorItem;
const normal = renderNormalItem;
const nested = renderNestedItem;
const toggle = renderToggleMenuItem;
const fancy = renderFancyMenuItem;

export {
  choice,
  autocomplete,
  separator,
  normal,
  nested,
  toggle,
  fancy
};
