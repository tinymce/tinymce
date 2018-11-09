/**
 * Util.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2018 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import { Element, Traverse } from '@ephox/sugar';
import { isList } from './ListType';

const hasFirstChildList = (li: Element) => {
  return Traverse.firstChild(li).map(isList).getOr(false);
};

const hasLastChildList = (li: Element) => {
  return Traverse.lastChild(li).map(isList).getOr(false);
};

export {
  hasFirstChildList,
  hasLastChildList
};