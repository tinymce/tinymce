/**
 * Nodes.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import { Arr } from '@ephox/katamari';
import { Element, Node } from '@ephox/sugar';
import Data from './Data';
import Html from './Html';

const isMatch = function (n) {
  return Node.isText(n) &&
    Node.value(n) !== undefined &&
    Data.regExp.test(Node.value(n));
};

// inlined sugars PredicateFilter.descendants for file size
const filterDescendants = function (scope, predicate) {
  let result = [];
  const dom = scope.dom();
  const children = Arr.map(dom.childNodes, Element.fromDom);

  Arr.each(children, function (x) {
    if (predicate(x)) {
      result = result.concat([ x ]);
    }
    result = result.concat(filterDescendants(x, predicate));
  });
  return result;
};

const findParentElm = function (elm, rootElm) {
  while (elm.parentNode) {
    if (elm.parentNode === rootElm) {
      return elm;
    }
    elm = elm.parentNode;
  }
};

const replaceWithSpans = function (html) {
  return html.replace(Data.regExpGlobal, Html.wrapCharWithSpan);
};

export default {
  isMatch,
  filterDescendants,
  findParentElm,
  replaceWithSpans
};