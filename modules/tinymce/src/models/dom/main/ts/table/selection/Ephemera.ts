/*
 NOTE: This file is duplicated in the following locations:
  - plugins/table/selection/Ephemera.ts
  - advtable
 Make sure that if making changes to this file, the other files are updated as well
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
