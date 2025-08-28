import { Arr, Type } from '@ephox/katamari';
import { ContentEditable, SugarElement, SugarNode } from '@ephox/sugar';

import * as Data from './Data';
import * as Html from './Html';

const isWrappedNbsp = (node: Node): node is HTMLSpanElement =>
  node.nodeName.toLowerCase() === 'span' && (node as HTMLSpanElement).classList.contains('mce-nbsp-wrap');

const isMatch = (n: SugarElement<Node>): n is SugarElement<Text> => {
  const value = SugarNode.value(n);
  return SugarNode.isText(n) &&
    Type.isString(value) &&
    Data.regExp.test(value);
};

const isContentEditableFalse = (node: SugarElement<Node>) => SugarNode.isHTMLElement(node) && ContentEditable.getRaw(node) === 'false';

const isChildEditable = (node: SugarElement<Node>, currentState: boolean) => {
  if (SugarNode.isHTMLElement(node) && !isWrappedNbsp(node.dom)) {
    const value = ContentEditable.getRaw(node);
    if (value === 'true') {
      return true;
    } else if (value === 'false') {
      return false;
    }
  }

  return currentState;
};

// inlined sugars PredicateFilter.descendants for file size but also make it only act on editable nodes it changes the current editable state when it traveses down
const filterEditableDescendants = <T extends Node>(scope: SugarElement<Node>, predicate: (x: SugarElement<Node>) => x is SugarElement<T>, editable: boolean): SugarElement<T>[] => {
  let result: SugarElement<T>[] = [];
  const dom = scope.dom;
  const children = Arr.map(dom.childNodes, SugarElement.fromDom);
  const isEditable = (node: SugarElement<Node>) => isWrappedNbsp(node.dom) || !isContentEditableFalse(node);

  Arr.each(children, (x) => {
    if (editable && isEditable(x) && predicate(x)) {
      result = result.concat([ x ]);
    }
    result = result.concat(filterEditableDescendants(x, predicate, isChildEditable(x, editable)));
  });
  return result;
};

const findParentElm = (elm: Node, rootElm: Element): Element | undefined => {
  while (elm.parentNode) {
    if (elm.parentNode === rootElm) {
      return rootElm;
    }
    elm = elm.parentNode;
  }

  return undefined;
};

const replaceWithSpans = (text: string): string =>
  text.replace(Data.regExpGlobal, Html.wrapCharWithSpan);

export {
  isWrappedNbsp,
  isMatch,
  filterEditableDescendants,
  findParentElm,
  replaceWithSpans
};
