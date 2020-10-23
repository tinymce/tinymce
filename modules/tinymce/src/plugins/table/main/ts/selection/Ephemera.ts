/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Ephemera as DarwinEphemera } from '@ephox/darwin';

const strSelected = 'data-mce-selected';
const strSelectedSelector = 'td[' + strSelected + '],th[' + strSelected + ']';
// used with not selectors
const strAttributeSelector = '[' + strSelected + ']';
const strFirstSelected = 'data-mce-first-selected';
const strFirstSelectedSelector = 'td[' + strFirstSelected + '],th[' + strFirstSelected + ']';
const strLastSelected = 'data-mce-last-selected';
const strLastSelectedSelector = 'td[' + strLastSelected + '],th[' + strLastSelected + ']';

export const attributeSelector = strAttributeSelector;

export const ephemera: DarwinEphemera = {
  selected: strSelected,
  selectedSelector: strSelectedSelector,
  firstSelected: strFirstSelected,
  firstSelectedSelector: strFirstSelectedSelector,
  lastSelected: strLastSelected,
  lastSelectedSelector: strLastSelectedSelector
};
