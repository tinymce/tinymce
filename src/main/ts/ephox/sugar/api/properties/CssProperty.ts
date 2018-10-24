import * as Css from './Css';
import Element from '../node/Element';

export default function (property: string, value: string) {
  var is = function (element: Element) {
    return Css.get(element, property) === value;
  };

  var remove = function (element: Element) {
    Css.remove(element, property);
  };

  var set = function (element: Element) {
    Css.set(element, property, value);
  };

  return {
    is: is,
    remove: remove,
    set: set
  };
};