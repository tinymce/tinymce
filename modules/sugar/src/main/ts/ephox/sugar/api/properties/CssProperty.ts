import { Element as DomElement, Node as DomNode } from '@ephox/dom-globals';
import Element from '../node/Element';
import * as Css from './Css';

export default (property: string, value: string) => {
  const is = (element: Element<DomElement>) => Css.get(element, property) === value;

  const remove = (element: Element<DomNode>) => Css.remove(element, property);

  const set = (element: Element<DomNode>) => Css.set(element, property, value);

  return {
    is,
    remove,
    set
  };
};
