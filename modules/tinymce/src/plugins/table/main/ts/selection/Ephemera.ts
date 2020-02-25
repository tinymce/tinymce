/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Fun } from '@ephox/katamari';

const sSelected = 'data-mce-selected';
const sSelectedSelector = 'td[' + sSelected + '],th[' + sSelected + ']';
// used with not selectors
const sAttributeSelector = '[' + sSelected + ']';
const sFirstSelected = 'data-mce-first-selected';
const sFirstSelectedSelector = 'td[' + sFirstSelected + '],th[' + sFirstSelected + ']';
const sLastSelected = 'data-mce-last-selected';
const sLastSelectedSelector = 'td[' + sLastSelected + '],th[' + sLastSelected + ']';

export const selected = Fun.constant(sSelected);
export const selectedSelector = Fun.constant(sSelectedSelector);
export const attributeSelector = Fun.constant(sAttributeSelector);
export const firstSelected = Fun.constant(sFirstSelected);
export const firstSelectedSelector = Fun.constant(sFirstSelectedSelector);
export const lastSelected = Fun.constant(sLastSelected);
export const lastSelectedSelector = Fun.constant(sLastSelectedSelector);
