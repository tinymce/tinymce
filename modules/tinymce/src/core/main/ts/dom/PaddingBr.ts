/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Arr, Unicode } from '@ephox/katamari';
import { Insert, Remove, Element, Node, Text, SelectorFilter, Traverse } from '@ephox/sugar';
import * as ElementType from './ElementType';

const getLastChildren = function (elm) {
  const children = [];
  let rawNode = elm.dom();

  while (rawNode) {
    children.push(Element.fromDom(rawNode));
    rawNode = rawNode.lastChild;
  }

  return children;
};

const removeTrailingBr = function (elm) {
  const allBrs = SelectorFilter.descendants(elm, 'br');
  const brs = Arr.filter(getLastChildren(elm).slice(-1), ElementType.isBr);
  if (allBrs.length === brs.length) {
    Arr.each(brs, Remove.remove);
  }
};

const fillWithPaddingBr = function (elm) {
  Remove.empty(elm);
  Insert.append(elm, Element.fromHtml('<br data-mce-bogus="1">'));
};

const isPaddingContents = function (elm) {
  return Node.isText(elm) ? Text.get(elm) === Unicode.nbsp : ElementType.isBr(elm);
};

const isPaddedElement = function (elm) {
  return Arr.filter(Traverse.children(elm), isPaddingContents).length === 1;
};

const trimBlockTrailingBr = function (elm) {
  Traverse.lastChild(elm).each(function (lastChild) {
    Traverse.prevSibling(lastChild).each(function (lastChildPrevSibling) {
      if (ElementType.isBlock(elm) && ElementType.isBr(lastChild) && ElementType.isBlock(lastChildPrevSibling)) {
        Remove.remove(lastChild);
      }
    });
  });
};

export default {
  removeTrailingBr,
  fillWithPaddingBr,
  isPaddedElement,
  trimBlockTrailingBr
};
