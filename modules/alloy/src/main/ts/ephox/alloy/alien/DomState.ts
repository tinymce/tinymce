import { Id, Obj } from '@ephox/katamari';
import { Element } from '@ephox/sugar';

const attrName = Id.generate('dom-data');
// This module stores information on the DOM node directly. This is so that it is automatically
// garbage collected rather than stored in a separate list that needs to be in sync with the DOM.
// We don't want people to use this very often (it's used for ForeignGui), and we especially don't
// want to try and store more than one thing on the DOM node, so the attribute name is hard-coded.
const getOrCreate = <A>(element: Element, f: () => A): A => {
  const existing = Obj.get(element.dom(), attrName);
  const data = existing.getOrThunk(f);
  element.dom()[attrName] = data;
  return data;
};

export {
  getOrCreate
};
