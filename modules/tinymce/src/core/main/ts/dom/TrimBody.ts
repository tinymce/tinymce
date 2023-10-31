import { Arr, Fun, Obj, Type } from '@ephox/katamari';
import { Attribute, Remove, SugarElement } from '@ephox/sugar';

import Tools from '../api/util/Tools';
import * as Zwsp from '../text/Zwsp';

// TINY-10305: Map over array for faster lookup.
const unescapedTextParents = Tools.makeMap('NOSCRIPT STYLE SCRIPT XMP IFRAME NOEMBED NOFRAMES PLAINTEXT', ' ');

const containsZwsp = (node: Node): boolean => Type.isString(node.nodeValue) && node.nodeValue.includes(Zwsp.ZWSP);

const getTemporaryNodeSelector = (tempAttrs: string[]): string =>
  `${tempAttrs.length === 0 ? '' : `${Arr.map(tempAttrs, (attr) => `[${attr}]`).join(',')},`}[data-mce-bogus="all"]`;

const getTemporaryNodes = (tempAttrs: string[], body: HTMLElement): NodeListOf<Element> =>
  body.querySelectorAll(getTemporaryNodeSelector(tempAttrs));

const createZwspCommentWalker = (body: HTMLElement): TreeWalker =>
  document.createTreeWalker(body, NodeFilter.SHOW_COMMENT, (node) => containsZwsp(node) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP);

const createUnescapedZwspTextWalker = (body: HTMLElement): TreeWalker =>
  document.createTreeWalker(body, NodeFilter.SHOW_TEXT, (node) => {
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
