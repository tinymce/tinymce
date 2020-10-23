/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Arr } from '@ephox/katamari';
import { SugarElement, SugarNode } from '@ephox/sugar';
import * as Data from './Data';
import * as Html from './Html';

const isMatch = (n: SugarElement) => {
  const value = SugarNode.value(n);
  return SugarNode.isText(n) &&
    value !== undefined &&
    Data.regExp.test(value);
};

// inlined sugars PredicateFilter.descendants for file size
const filterDescendants = (scope: SugarElement, predicate: (x: SugarElement) => boolean) => {
  let result: SugarElement[] = [];
  const dom = scope.dom;
  const children = Arr.map(dom.childNodes, SugarElement.fromDom);

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

const replaceWithSpans = (text: string) => text.replace(Data.regExpGlobal, Html.wrapCharWithSpan);

export {
  isMatch,
  filterDescendants,
  findParentElm,
  replaceWithSpans
};
