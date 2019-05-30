import * as Css from './Css';
import Element from '../node/Element';

export default function (property: string, value: string) {
  const is = function (element: Element) {
    return Css.get(element, property) === value;
  };

  const remove = function (element: Element) {
    Css.remove(element, property);
  };

  const set = function (element: Element) {
    Css.set(element, property, value);
  };

  return {
    is,
    remove,
    set
  };
}