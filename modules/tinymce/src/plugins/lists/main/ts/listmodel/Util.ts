/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Compare, SugarElement, Traverse } from '@ephox/sugar';

export const enum ListType {
  OL = 'ol',
  UL = 'ul'
}

const isList = (el: SugarElement<Node>): el is SugarElement<HTMLOListElement | HTMLUListElement> =>
  Compare.is(el, 'OL,UL');

const hasFirstChildList = (el: SugarElement<HTMLElement>): boolean =>
  Traverse.firstChild(el).exists(isList);

const hasLastChildList = (el: SugarElement<HTMLElement>): boolean =>
  Traverse.lastChild(el).exists(isList);

export {
  isList,
  hasFirstChildList,
  hasLastChildList
};
