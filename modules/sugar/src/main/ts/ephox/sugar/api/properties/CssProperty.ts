import { SugarElement } from '../node/SugarElement';
import * as Css from './Css';

export default (property: string, value: string) => {
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
