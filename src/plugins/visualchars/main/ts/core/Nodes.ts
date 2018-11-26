/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
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