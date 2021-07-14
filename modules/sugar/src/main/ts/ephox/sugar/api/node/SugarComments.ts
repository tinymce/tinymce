import { Fun, Optional } from '@ephox/katamari';
import { PlatformDetection } from '@ephox/sand';

import { SugarElement } from './SugarElement';

interface VendorDocument {
  readonly createTreeWalker: (root: Node, whatToShow: number, filter: NodeFilter | null, entityReferenceExpansion?: boolean) => TreeWalker;
}

const regularGetNodes = <T extends Node> (texas: TreeWalker): SugarElement<T>[] => {
  const ret: SugarElement<T>[] = [];
  while (texas.nextNode() !== null) {
    ret.push(SugarElement.fromDom(texas.currentNode as T));
  }
  return ret;
};

const ieGetNodes = <T extends Node> (texas: TreeWalker): SugarElement<T>[] => {
  // IE throws an error on nextNode() when there are zero nodes available, and any attempts I made to detect this
  // just resulted in throwing away valid cases
  try {
    return regularGetNodes<T>(texas);
  } catch (e) {
    return [];
  }
};

// I hate needing platform detection in Sugar, but the alternative is to always try/catch which will swallow coding errors as well
const getNodes = <T extends Node> (texas: TreeWalker): SugarElement<T>[] => {
  const browser = PlatformDetection.detect().browser;
  return browser.isIE() || browser.isEdge() ? ieGetNodes(texas) : regularGetNodes(texas);
};

// Weird, but oh well
const noFilter = Fun.constant(Fun.always);

const find = (node: SugarElement<Node>, filterOpt: Optional<(n: string | null) => boolean>): SugarElement<Comment>[] => {

  const vmlFilter: any = filterOpt.fold(noFilter, (filter) => (comment: Node) => filter(comment.nodeValue));

  // the standard wants an object, IE wants a function. But everything is an object, so let's be sneaky
  // http://www.bennadel.com/blog/2607-finding-html-comment-nodes-in-the-dom-using-treewalker.htm
  vmlFilter.acceptNode = vmlFilter;

  // Need to use a cast here, as tslib doesn't include the fourth argument anymore since it's deprecated
  // however we still need it for IE unfortunately.
  const texas = (document as VendorDocument).createTreeWalker(node.dom, NodeFilter.SHOW_COMMENT, vmlFilter, false);

  return getNodes<Comment>(texas);
};

export { find };
