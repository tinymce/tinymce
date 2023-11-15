/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Arr, Fun, Obj, Strings, Type } from '@ephox/katamari';
import { Attribute, Remove, SugarElement } from '@ephox/sugar';

import Tools from '../api/util/Tools';
import * as Zwsp from '../text/Zwsp';

// TINY-10337: Map over array for faster lookup.
const unescapedTextParents = Tools.makeMap('NOSCRIPT STYLE SCRIPT XMP IFRAME NOEMBED NOFRAMES PLAINTEXT', ' ');

const containsZwsp = (node: Node): boolean => Type.isString(node.nodeValue) && Strings.contains(node.nodeValue, Zwsp.ZWSP);

const getTemporaryNodeSelector = (tempAttrs: string[]): string =>
  `${tempAttrs.length === 0 ? '' : `${Arr.map(tempAttrs, (attr) => `[${attr}]`).join(',')},`}[data-mce-bogus="all"]`;

const getTemporaryNodes = (tempAttrs: string[], body: HTMLElement): NodeListOf<Element> =>
  body.querySelectorAll(getTemporaryNodeSelector(tempAttrs));

const createWalker = (body: HTMLElement, whatToShow: number, filter: NodeFilter): TreeWalker =>
  // TINY-10215: IE11's implementation of createTreeWalker is consistent with DOM Level 2, which requires a fourth
  // entityReferenceExpansion boolean argument to Document.createTreeWalker(). Modern browsers silently ignore this
  // fourth argument.
  // https://www.w3.org/TR/DOM-Level-2-Traversal-Range/traversal.html#NodeIteratorFactory-createTreeWalker
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  document.createTreeWalker(body, whatToShow, filter, false);

const createZwspCommentWalker = (body: HTMLElement): TreeWalker =>
  createWalker(body, NodeFilter.SHOW_COMMENT, (node) => containsZwsp(node) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP);

const createUnescapedZwspTextWalker = (body: HTMLElement): TreeWalker =>
  createWalker(body, NodeFilter.SHOW_TEXT, (node) => {
    if (containsZwsp(node)) {
      const parent = node.parentNode;
      return parent && Obj.has(unescapedTextParents, parent.nodeName) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
    } else {
      return NodeFilter.FILTER_SKIP;
    }
  });

const hasZwspComment = (body: HTMLElement): boolean =>
  createZwspCommentWalker(body).nextNode() !== null;

const hasUnescapedZwspText = (body: HTMLElement): boolean =>
  createUnescapedZwspTextWalker(body).nextNode() !== null;

const hasTemporaryNode = (tempAttrs: string[], body: HTMLElement): boolean =>
  body.querySelector(getTemporaryNodeSelector(tempAttrs)) !== null;

const trimTemporaryNodes = (tempAttrs: string[], body: HTMLElement): void => {
  Arr.each(getTemporaryNodes(tempAttrs, body), (elm) => {
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

const emptyAllNodeValuesInWalker = (walker: TreeWalker): void => {
  let curr = walker.nextNode();
  while (curr !== null) {
    curr.nodeValue = null;
    curr = walker.nextNode();
  }
};

const emptyZwspComments = Fun.compose(emptyAllNodeValuesInWalker, createZwspCommentWalker);

const emptyUnescapedZwspTexts = Fun.compose(emptyAllNodeValuesInWalker, createUnescapedZwspTextWalker);

const trim = (body: HTMLElement, tempAttrs: string[]): HTMLElement => {
  const conditionalTrims: { condition: (elm: HTMLElement) => boolean; action: (elm: HTMLElement) => void }[] = [
    {
      condition: Fun.curry(hasTemporaryNode, tempAttrs),
      action: Fun.curry(trimTemporaryNodes, tempAttrs)
    },
    {
      condition: hasZwspComment,
      action: emptyZwspComments
    },
    {
      condition: hasUnescapedZwspText,
      action: emptyUnescapedZwspTexts
    }
  ];

  let trimmed = body;
  let cloned = false;

  Arr.each(conditionalTrims, ({ condition, action }) => {
    if (condition(trimmed)) {
      if (!cloned) {
        trimmed = body.cloneNode(true) as HTMLElement;
        cloned = true;
      }
      action(trimmed);
    }
  });

  return trimmed;
};

export {
  trim,
  hasTemporaryNode,
  hasZwspComment,
  hasUnescapedZwspText,
  trimTemporaryNodes,
  emptyZwspComments,
  emptyUnescapedZwspTexts
};
