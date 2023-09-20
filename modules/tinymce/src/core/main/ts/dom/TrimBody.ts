import { Arr, Type } from '@ephox/katamari';
import { Attribute, Remove, SugarElement } from '@ephox/sugar';

import * as Zwsp from '../text/Zwsp';

const getTemporaryNodeSelector = (tempAttrs: string[]): string =>
  `${tempAttrs.length === 0 ? '' : `${Arr.map(tempAttrs, (attr) => `[${attr}]`).join(',')},`}[data-mce-bogus="all"]`;

const getTemporaryNodes = (body: HTMLElement, tempAttrs: string[]): NodeListOf<Element> =>
  body.querySelectorAll(getTemporaryNodeSelector(tempAttrs));

const createCommentWalker = (body: HTMLElement): TreeWalker =>
  document.createTreeWalker(body, NodeFilter.SHOW_COMMENT, null);

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
    if (Type.isString(comment.nodeValue) && comment.nodeValue.includes(Zwsp.ZWSP)) {
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
