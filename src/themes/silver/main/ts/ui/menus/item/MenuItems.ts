/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { renderAutocompleteItem, renderChoiceItem } from './build/ChoiceItem';
import { renderFancyMenuItem } from './build/FancyMenuItem';
import { renderNormalItem } from './build/NormalMenuItem';
import { renderNestedItem } from './build/NestedMenuItem';
import { renderSeparatorItem } from './build/SeparatorItem';
// import { renderStyleItem } from './build/StyleMenuItem';
import { renderToggleMenuItem } from './build/ToggleMenuItem';

const choice = renderChoiceItem;
const autocomplete = renderAutocompleteItem;
const separator = renderSeparatorItem;
// const style = renderStyleItem;
const normal = renderNormalItem;
const nested = renderNestedItem;
const toggle = renderToggleMenuItem;
const fancy = renderFancyMenuItem;

export {
  choice,
  autocomplete,
  separator,
  style,
  normal,
  nested,
  toggle,
  fancy
};
