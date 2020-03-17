import { document, Node as DomNode, TreeWalker, NodeFilter, Comment } from '@ephox/dom-globals';
import { Fun, Option } from '@ephox/katamari';
import { PlatformDetection } from '@ephox/sand';
import Element from './Element';

const regularGetNodes = function <T extends DomNode> (texas: TreeWalker) {
  const ret: Element<T>[] = [];
  while (texas.nextNode() !== null) {
    ret.push(Element.fromDom(texas.currentNode as T));
  }
  return ret;
};

const ieGetNodes = function <T extends DomNode> (texas: TreeWalker) {
  // IE throws an error on nextNode() when there are zero nodes available, and any attempts I made to detect this
  // just resulted in throwing away valid cases
  try {
    return regularGetNodes<T>(texas);
  } catch (e) {
    return [];
  }
};

// I hate needing platform detection in Sugar, but the alternative is to always try/catch which will swallow coding errors as well
const browser = PlatformDetection.detect().browser;
const getNodes = browser.isIE() || browser.isEdge() ? ieGetNodes : regularGetNodes;

// Weird, but oh well
const noFilter = Fun.constant(Fun.constant(true));

const find = function (node: Element<DomNode>, filterOpt: Option<(n: string) => boolean>) {

  const vmlFilter: any = filterOpt.fold(noFilter, function (filter) {
    return function (comment: DomNode) {
      return filter(comment.nodeValue);
    };
  });

  // the standard wants an object, IE wants a function. But everything is an object, so let's be sneaky
  // http://www.bennadel.com/blog/2607-finding-html-comment-nodes-in-the-dom-using-treewalker.htm
  vmlFilter.acceptNode = vmlFilter;

  const texas = document.createTreeWalker(node.dom(), NodeFilter.SHOW_COMMENT, vmlFilter, false);

  return getNodes<Comment>(texas);
};

export { find };
