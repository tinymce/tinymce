/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Arr, Type } from '@ephox/katamari';
import { Attribute, Remove, SugarElement } from '@ephox/sugar';

import * as Zwsp from '../text/Zwsp';

const getTemporaryNodeSelector = (tempAttrs: string[]): string =>
  `${tempAttrs.length === 0 ? '' : `${Arr.map(tempAttrs, (attr) => `[${attr}]`).join(',')},`}[data-mce-bogus="all"]`;

const getTemporaryNodes = (body: HTMLElement, tempAttrs: string[]): NodeListOf<Element> =>
  body.querySelectorAll(getTemporaryNodeSelector(tempAttrs));

const createCommentWalker = (body: HTMLElement): TreeWalker =>
  // TINY-10215: IE11's implementation of createTreeWalker is consistent with DOM Level 2, which requires a fourth
  // entityReferenceExpansion boolean argument to Document.createTreeWalker(). Modern browsers silently ignore this
  // fourth argument.
  // https://www.w3.org/TR/DOM-Level-2-Traversal-Range/traversal.html#NodeIteratorFactory-createTreeWalker
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  document.createTreeWalker(body, NodeFilter.SHOW_COMMENT, null, false);

const hasComments = (body: HTMLElement): boolean =>
  createCommentWalker(body).nextNode() !== null;

const hasTemporaryNodes = (body: HTMLElement, tempAttrs: string[]): boolean =>
  body.querySelector(getTemporaryNodeSelector(tempAttrs)) !== null;

const trimTemporaryNodes = (body: HTMLElement, tempAttrs: string[]): void => {
  Arr.each(getTemporaryNodes(body, tempAttrs), (elm) => {
    const element = SugarElement.fromDom(elm);
    if (Attribute.get(element, 'data-mce-bogus') === 'all') {
      Remove.remove(element);
    } else {
      Arr.each(tempAttrs, (attr) => {
        if (Attribute.has(element, attr)) {
          Attribute.remove(element, attr);
        }
      });
    }
  });
};

const removeCommentsContainingZwsp = (body: HTMLElement): void => {
  const walker = createCommentWalker(body);
  let nextNode = walker.nextNode();
  while (nextNode !== null) {
    const comment = walker.currentNode as Comment;
    nextNode = walker.nextNode();
    // TINY-10215: Use String.prototype.indexOf() as IE11 does not support String.prototype.includes().
    if (Type.isString(comment.nodeValue) && comment.nodeValue.indexOf(Zwsp.ZWSP) !== -1) {
      Remove.remove(SugarElement.fromDom(comment));
    }
  }
};

const deepClone = (body: HTMLElement): HTMLElement => body.cloneNode(true) as HTMLElement;

const trim = (body: HTMLElement, tempAttrs: string[]): HTMLElement => {
  let trimmed = body;

  if (hasComments(body)) {
    trimmed = deepClone(body);
    removeCommentsContainingZwsp(trimmed);
    if (hasTemporaryNodes(trimmed, tempAttrs)) {
      trimTemporaryNodes(trimmed, tempAttrs);
    }
  } else if (hasTemporaryNodes(body, tempAttrs)) {
    trimmed = deepClone(body);
    trimTemporaryNodes(trimmed, tempAttrs);
  }

  return trimmed;
};

export {
  trim,
  hasComments,
  hasTemporaryNodes,
  removeCommentsContainingZwsp,
  trimTemporaryNodes
};
