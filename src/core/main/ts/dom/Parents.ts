/**
 * Parents.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
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