import { Element as DomElement } from '@ephox/dom-globals';
import Element from '../node/Element';
import * as Attr from './Attr';

export default (attribute: string, value: string) => {
  const is = (element: Element<DomElement>) => Attr.get(element, attribute) === value;

  const remove = (element: Element<DomElement>) => Attr.remove(element, attribute);

  const set = (element: Element<DomElement>) => Attr.set(element, attribute, value);

  return {
    is,
    remove,
    set
  };
};
