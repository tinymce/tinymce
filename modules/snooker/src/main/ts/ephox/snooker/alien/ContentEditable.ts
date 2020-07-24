import { Option } from '@ephox/katamari';
import { Attribute, SelectorFind, SugarElement } from '@ephox/sugar';

const isContentEditableTrue = (elm: SugarElement) => Attribute.get(elm, 'contenteditable') === 'true';

const findClosestContentEditable = (target: SugarElement, isRoot: (elm: SugarElement) => boolean): Option<SugarElement> => SelectorFind.closest(target, '[contenteditable]', isRoot);

export {
  isContentEditableTrue,
  findClosestContentEditable
};
