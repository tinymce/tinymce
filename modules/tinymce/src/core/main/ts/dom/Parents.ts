/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Fun } from '@ephox/katamari';
import { Compare, Traverse, Element } from '@ephox/sugar';

const dropLast = <T>(xs: T[]): T[] => xs.slice(0, -1);

const parentsUntil = (start: Element, root: Element, predicate: (elm: Element) => boolean): Element[] => {
  if (Compare.contains(root, start)) {
    return dropLast(Traverse.parents(start, function (elm) {
      return predicate(elm) || Compare.eq(elm, root);
    }));
  } else {
    return [];
  }
};

const parents = (start: Element, root: Element): Element[] => {
  return parentsUntil(start, root, Fun.constant(false));
};

const parentsAndSelf = (start: Element, root: Element): Element[] => {
  return [start].concat(parents(start, root));
};

export default {
  parentsUntil,
  parents,
  parentsAndSelf
};