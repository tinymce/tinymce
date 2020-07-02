import { Element as DomElement } from '@ephox/dom-globals';
import Element from '../node/Element';
import * as Attr from './Attr';

export default (attribute: string, value: string) => {
  const is = (element: Element<DomElement>): boolean =>
    Attr.get(element, attribute) === value;

  const remove = (element: Element<DomElement>): void =>
    Attr.remove(element, attribute);

  const set = (element: Element<DomElement>): void =>
    Attr.set(element, attribute, value);

  return {
    is,
    remove,
    set
  };
};
