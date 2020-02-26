/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Fun } from '@ephox/katamari';

const strSelected = 'data-mce-selected';
const strSelectedSelector = 'td[' + strSelected + '],th[' + strSelected + ']';
// used with not selectors
const strAttributeSelector = '[' + strSelected + ']';
const strFirstSelected = 'data-mce-first-selected';
const strFirstSelectedSelector = 'td[' + strFirstSelected + '],th[' + strFirstSelected + ']';
const strLastSelected = 'data-mce-last-selected';
const strLastSelectedSelector = 'td[' + strLastSelected + '],th[' + strLastSelected + ']';

export const selected = Fun.constant(strSelected);
export const selectedSelector = Fun.constant(strSelectedSelector);
export const attributeSelector = Fun.constant(strAttributeSelector);
export const firstSelected = Fun.constant(strFirstSelected);
export const firstSelectedSelector = Fun.constant(strFirstSelectedSelector);
export const lastSelected = Fun.constant(strLastSelected);
export const lastSelectedSelector = Fun.constant(strLastSelectedSelector);
