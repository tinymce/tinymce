/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
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