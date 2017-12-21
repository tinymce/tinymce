/**
 * PaddingBr.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import { Arr } from '@ephox/katamari';
import { Insert } from '@ephox/sugar';
import { Remove } from '@ephox/sugar';
import { Element } from '@ephox/sugar';
import { Node } from '@ephox/sugar';
import { Text } from '@ephox/sugar';
import { SelectorFilter } from '@ephox/sugar';
import { Traverse } from '@ephox/sugar';
import ElementType from './ElementType';

var getLastChildren = function (elm) {
  var children = [], rawNode = elm.dom();

  while (rawNode) {
    children.push(Element.fromDom(rawNode));
    rawNode = rawNode.lastChild;
  }

  return children;
};

var removeTrailingBr = function (elm) {
  var allBrs = SelectorFilter.descendants(elm, 'br');
  var brs = Arr.filter(getLastChildren(elm).slice(-1), ElementType.isBr);
  if (allBrs.length === brs.length) {
    Arr.each(brs, Remove.remove);
  }
};

var fillWithPaddingBr = function (elm) {
  Remove.empty(elm);
  Insert.append(elm, Element.fromHtml('<br data-mce-bogus="1">'));
};

var isPaddingContents = function (elm) {
  return Node.isText(elm) ? Text.get(elm) === '\u00a0' : ElementType.isBr(elm);
};

var isPaddedElement = function (elm) {
  return Arr.filter(Traverse.children(elm), isPaddingContents).length === 1;
};

var trimBlockTrailingBr = function (elm) {
  Traverse.lastChild(elm).each(function (lastChild) {
    Traverse.prevSibling(lastChild).each(function (lastChildPrevSibling) {
      if (ElementType.isBlock(elm) && ElementType.isBr(lastChild) && ElementType.isBlock(lastChildPrevSibling)) {
        Remove.remove(lastChild);
      }
    });
  });
};

export default <any> {
  removeTrailingBr: removeTrailingBr,
  fillWithPaddingBr: fillWithPaddingBr,
  isPaddedElement: isPaddedElement,
  trimBlockTrailingBr: trimBlockTrailingBr
};