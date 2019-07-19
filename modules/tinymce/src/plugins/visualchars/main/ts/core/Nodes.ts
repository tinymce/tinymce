/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Arr } from '@ephox/katamari';
import { Element, Node as SugarNode } from '@ephox/sugar';
import Data from './Data';
import Html from './Html';
import { Node } from '@ephox/dom-globals';

const isMatch = (n: Element) => {
  return SugarNode.isText(n) &&
    SugarNode.value(n) !== undefined &&
    Data.regExp.test(SugarNode.value(n));
};

// inlined sugars PredicateFilter.descendants for file size
const filterDescendants = (scope: Element, predicate: (x: Element) => boolean) => {
  let result: Element[] = [];
  const dom = scope.dom();
  const children = Arr.map(dom.childNodes, Element.fromDom);

  Arr.each(children, (x) => {
    if (predicate(x)) {
      result = result.concat([ x ]);
    }
    result = result.concat(filterDescendants(x, predicate));
  });
  return result;
};

const findParentElm = (elm: Node, rootElm: Node) => {
  while (elm.parentNode) {
    if (elm.parentNode === rootElm) {
      return elm;
    }
    elm = elm.parentNode;
  }
};

const replaceWithSpans = (html: string) => {
  return html.replace(Data.regExpGlobal, Html.wrapCharWithSpan);
};

export default {
  isMatch,
  filterDescendants,
  findParentElm,
  replaceWithSpans
};