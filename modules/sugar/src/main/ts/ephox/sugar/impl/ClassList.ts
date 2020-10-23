import { Arr } from '@ephox/katamari';
import { SugarElement } from '../api/node/SugarElement';
import * as AttrList from '../api/properties/AttrList';

// IE11 Can return undefined for a classList on elements such as math, so we make sure it's not undefined before attempting to use it.
const supports = (element: SugarElement<Node>): element is SugarElement<Element> => (element.dom as Element).classList !== undefined;

const get = (element: SugarElement<Element>) => AttrList.read(element, 'class');

const add = (element: SugarElement<Element>, clazz: string) => AttrList.add(element, 'class', clazz);

const remove = (element: SugarElement<Element>, clazz: string) => AttrList.remove(element, 'class', clazz);

const toggle = (element: SugarElement<Element>, clazz: string) => {
  if (Arr.contains(get(element), clazz)) {
    return remove(element, clazz);
  } else {
    return add(element, clazz);
  }
};

export {
  get,
  add,
  remove,
  toggle,
  supports
};
