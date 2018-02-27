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
import { Compare, Traverse } from '@ephox/sugar';

const dropLast = function (xs) {
  return xs.slice(0, -1);
};

const parentsUntil = function (startNode, rootElm, predicate) {
  if (Compare.contains(rootElm, startNode)) {
    return dropLast(Traverse.parents(startNode, function (elm) {
      return predicate(elm) || Compare.eq(elm, rootElm);
    }));
  } else {
    return [];
  }
};

const parents = function (startNode, rootElm) {
  return parentsUntil(startNode, rootElm, Fun.constant(false));
};

const parentsAndSelf = function (startNode, rootElm) {
  return [startNode].concat(parents(startNode, rootElm));
};

export default {
  parentsUntil,
  parents,
  parentsAndSelf
};