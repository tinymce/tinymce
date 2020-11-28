import { SugarElement } from '../node/SugarElement';
import * as Css from './Css';

export interface CssProperty {
  readonly is: (element: SugarElement<Element>) => boolean;
  readonly remove: (element: SugarElement<Element>) => void;
  readonly set: (element: SugarElement<Element>) => void;
}

export const CssProperty = (property: string, value: string): CssProperty => {
  const is = (element: SugarElement<Element>): boolean =>
    Css.get(element, property) === value;

  const remove = (element: SugarElement<Node>): void =>
    Css.remove(element, property);

  const set = (element: SugarElement<Node>): void =>
    Css.set(element, property, value);

  return {
    is,
    remove,
    set
  };
};
