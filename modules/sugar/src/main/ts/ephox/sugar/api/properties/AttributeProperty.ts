import { SugarElement } from '../node/SugarElement';
import * as Attribute from './Attribute';

export interface AttributeProperty {
  readonly is: (element: SugarElement<Element>) => boolean;
  readonly remove: (element: SugarElement<Element>) => void;
  readonly set: (element: SugarElement<Element>) => void;
}

export const AttributeProperty = (attribute: string, value: string): AttributeProperty => {
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
