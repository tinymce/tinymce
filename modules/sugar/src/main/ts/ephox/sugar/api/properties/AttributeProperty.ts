import { SugarElement } from '../node/SugarElement';
import * as Attribute from './Attribute';

export default (attribute: string, value: string) => {
  const is = (element: SugarElement<Element>): boolean =>
    Attribute.get(element, attribute) === value;

  const remove = (element: SugarElement<Element>): void =>
    Attribute.remove(element, attribute);

  const set = (element: SugarElement<Element>): void =>
    Attribute.set(element, attribute, value);

  return {
    is,
    remove,
    set
  };
};
