import * as Css from './Css';
import Element from '../node/Element';
import { Element as DomElement, Node as DomNode } from '@ephox/dom-globals';

export default function (property: string, value: string) {
  const is = function (element: Element<DomElement>) {
    return Css.get(element, property) === value;
  };

  const remove = function (element: Element<DomNode>) {
    Css.remove(element, property);
  };

  const set = function (element: Element<DomNode>) {
    Css.set(element, property, value);
  };

  return {
    is,
    remove,
    set
  };
}