import { Fun, Optional } from '@ephox/katamari';

import { SugarElement } from './SugarElement';

const getNodes = <T extends Node> (texas: TreeWalker): SugarElement<T>[] => {
  const ret: SugarElement<T>[] = [];
  while (texas.nextNode() !== null) {
    ret.push(SugarElement.fromDom(texas.currentNode as T));
  }
  return ret;
};

const find = (node: SugarElement<Node>, filterOpt: Optional<(n: string | null) => boolean>): SugarElement<Comment>[] => {
  const predicate = filterOpt.getOr(Fun.always);

  const texas = document.createTreeWalker(node.dom, NodeFilter.SHOW_COMMENT, {
    acceptNode: (comment) => predicate(comment.nodeValue) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT
  });
  return getNodes<Comment>(texas);
};

export { find };
