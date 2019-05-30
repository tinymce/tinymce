import { Option } from '@ephox/katamari';
import { Attr, Element, SelectorFind } from '@ephox/sugar';

const isContentEditableTrue = (elm: Element) => Attr.get(elm, 'contenteditable') === 'true';

const findClosestContentEditable = (target: Element, isRoot: (elm: Element) => boolean): Option<Element> => {
  return SelectorFind.closest(target, '[contenteditable]', isRoot);
};

export {
  isContentEditableTrue,
  findClosestContentEditable
};
