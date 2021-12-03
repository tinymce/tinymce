/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Optional } from '@ephox/katamari';
import { SelectorFind, SugarElement } from '@ephox/sugar';

const autocompleteSelector = '[data-mce-autocompleter]';

export const detect = (elm: SugarElement): Optional<SugarElement> => SelectorFind.closest(elm, autocompleteSelector);

export const findIn = (elm: SugarElement): Optional<SugarElement> => SelectorFind.descendant(elm, autocompleteSelector);
