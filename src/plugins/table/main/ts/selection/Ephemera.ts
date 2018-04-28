/**
 * Ephemera.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import { Fun } from '@ephox/katamari';

const selected = 'data-mce-selected';
const selectedSelector = 'td[' + selected + '],th[' + selected + ']';
// used with not selectors
const attributeSelector = '[' + selected + ']';
const firstSelected = 'data-mce-first-selected';
const firstSelectedSelector = 'td[' + firstSelected + '],th[' + firstSelected + ']';
const lastSelected = 'data-mce-last-selected';
const lastSelectedSelector = 'td[' + lastSelected + '],th[' + lastSelected + ']';

export default {
  selected: Fun.constant(selected),
  selectedSelector: Fun.constant(selectedSelector),
  attributeSelector: Fun.constant(attributeSelector),
  firstSelected: Fun.constant(firstSelected),
  firstSelectedSelector: Fun.constant(firstSelectedSelector),
  lastSelected: Fun.constant(lastSelected),
  lastSelectedSelector: Fun.constant(lastSelectedSelector)
};