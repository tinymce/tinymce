import { Element as DomElement, Node as DomNode } from '@ephox/dom-globals';
import Element from '../node/Element';
import * as Css from './Css';

export default (property: string, value: string) => {
  const is = (element: Element<DomElement>): boolean =>
    Css.get(element, property) === value;

  const remove = (element: Element<DomNode>): void =>
    Css.remove(element, property);

  const set = (element: Element<DomNode>): void =>
    Css.set(element, property, value);

  return {
    is,
    remove,
    set
  };
};
