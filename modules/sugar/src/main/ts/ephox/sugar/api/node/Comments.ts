import { document, Node, TreeWalker } from '@ephox/dom-globals';
import { Fun, Option } from '@ephox/katamari';
import { NodeFilter, PlatformDetection } from '@ephox/sand';
import Element from './Element';

const regularGetNodes = function (texas: TreeWalker) {
  const ret: Element[] = [];
  while (texas.nextNode() !== null) { ret.push(Element.fromDom(texas.currentNode)); }
  return ret;
};

const ieGetNodes = function (texas: TreeWalker) {
  // IE throws an error on nextNode() when there are zero nodes available, and any attempts I made to detect this
  // just resulted in throwing away valid cases
  try {
    return regularGetNodes(texas);
  } catch (e) {
    return [];
  }
};

// I hate needing platform detection in Sugar, but the alternative is to always try/catch which will swallow coding errors as well
const browser = PlatformDetection.detect().browser;
const getNodes = browser.isIE() || browser.isEdge() ? ieGetNodes : regularGetNodes;

// Weird, but oh well
const noFilter = Fun.constant(Fun.constant(true));

const find = function (node: Element, filterOpt: Option<(n: string) => boolean>) {

  const vmlFilter: any = filterOpt.fold(noFilter, function (filter) {
    return function (comment: Node) {
      return filter(comment.nodeValue);
    };
  });

  // the standard wants an object, IE wants a function. But everything is an object, so let's be sneaky
  // http://www.bennadel.com/blog/2607-finding-html-comment-nodes-in-the-dom-using-treewalker.htm
  vmlFilter.acceptNode = vmlFilter;

  const texas = document.createTreeWalker(node.dom() as Node, NodeFilter().SHOW_COMMENT, vmlFilter, false);

  return getNodes(texas);
};

export { find };
