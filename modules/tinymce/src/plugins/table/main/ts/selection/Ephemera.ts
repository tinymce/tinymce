/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

const strSelected = 'data-mce-selected';
const strSelectedSelector = 'td[' + strSelected + '],th[' + strSelected + ']';
// used with not selectors
const strAttributeSelector = '[' + strSelected + ']';
const strFirstSelected = 'data-mce-first-selected';
const strFirstSelectedSelector = 'td[' + strFirstSelected + '],th[' + strFirstSelected + ']';
const strLastSelected = 'data-mce-last-selected';
const strLastSelectedSelector = 'td[' + strLastSelected + '],th[' + strLastSelected + ']';

export const selected = strSelected;
export const selectedSelector = strSelectedSelector;
export const attributeSelector = strAttributeSelector;
export const firstSelected = strFirstSelected;
export const firstSelectedSelector = strFirstSelectedSelector;
export const lastSelected = strLastSelected;
export const lastSelectedSelector = strLastSelectedSelector;
