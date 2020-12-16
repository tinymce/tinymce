/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Arr, Unicode } from '@ephox/katamari';
import { Insert, Remove, SelectorFilter, SugarElement, SugarNode, SugarText, Traverse } from '@ephox/sugar';
import * as ElementType from './ElementType';

const getLastChildren = (elm) => {
  const children = [];
  let rawNode = elm.dom;

  while (rawNode) {
    children.push(SugarElement.fromDom(rawNode));
    rawNode = rawNode.lastChild;
  }

  return children;
};

const removeTrailingBr = (elm) => {
  const allBrs = SelectorFilter.descendants(elm, 'br');
  const brs = Arr.filter(getLastChildren(elm).slice(-1), ElementType.isBr);
  if (allBrs.length === brs.length) {
    Arr.each(brs, Remove.remove);
  }
};

const fillWithPaddingBr = (elm) => {
  Remove.empty(elm);
  Insert.append(elm, SugarElement.fromHtml('<br data-mce-bogus="1">'));
};

const isPaddingContents = (elm) => {
  return SugarNode.isText(elm) ? SugarText.get(elm) === Unicode.nbsp : ElementType.isBr(elm);
};

const isPaddedElement = (elm) => {
  return Arr.filter(Traverse.children(elm), isPaddingContents).length === 1;
};

const trimBlockTrailingBr = (elm) => {
  Traverse.lastChild(elm).each((lastChild) => {
    Traverse.prevSibling(lastChild).each((lastChildPrevSibling) => {
      if (ElementType.isBlock(elm) && ElementType.isBr(lastChild) && ElementType.isBlock(lastChildPrevSibling)) {
        Remove.remove(lastChild);
      }
    });
  });
};

export {
  removeTrailingBr,
  fillWithPaddingBr,
  isPaddedElement,
  trimBlockTrailingBr
};
