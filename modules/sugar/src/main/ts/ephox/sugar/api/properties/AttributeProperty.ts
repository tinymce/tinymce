import * as Attr from './Attr';
import Element from '../node/Element';
import { Element as DomElement } from '@ephox/dom-globals';

export default function (attribute: string, value: string) {
  const is = function (element: Element<DomElement>) {
    return Attr.get(element, attribute) === value;
  };

  const remove = function (element: Element<DomElement>) {
    Attr.remove(element, attribute);
  };

  const set = function (element: Element<DomElement>) {
    Attr.set(element, attribute, value);
  };

  return {
    is,
    remove,
    set,
  };
}
