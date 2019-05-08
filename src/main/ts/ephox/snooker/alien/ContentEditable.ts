import { Fun, Option } from '@ephox/katamari';
import { Attr, Element, PredicateFind } from '@ephox/sugar';

const matchContentEditable = (value: string, e: Element) => Attr.get(e, 'contenteditable') === value;

const isContentEditableTrue = Fun.curry(matchContentEditable, 'true');
const isContentEditableFalse = Fun.curry(matchContentEditable, 'false');

const findClosestContentEditableContext = (target: Element, isRoot: (elm: Element) => boolean): Option<Element> => {
  return PredicateFind.ancestor(target, (ancestor) => {
    return isContentEditableTrue(ancestor) || isContentEditableFalse(ancestor);
  }, isRoot);
};

export {
  isContentEditableTrue,
  isContentEditableFalse,
  findClosestContentEditableContext
};
