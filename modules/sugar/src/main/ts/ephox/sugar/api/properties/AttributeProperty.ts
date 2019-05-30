import * as Attr from './Attr';
import Element from '../node/Element';

export default function (attribute, value) {
  const is = function (element: Element) {
    return Attr.get(element, attribute) === value;
  };

  const remove = function (element: Element) {
    Attr.remove(element, attribute);
  };

  const set = function (element: Element) {
    Attr.set(element, attribute, value);
  };

  return {
    is,
    remove,
    set,
  };
}