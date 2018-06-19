import Attr from './Attr';
import Element from '../node/Element';



export default function (attribute, value) {
  var is = function (element: Element) {
    return Attr.get(element, attribute) === value;
  };

  var remove = function (element: Element) {
    Attr.remove(element, attribute);
  };

  var set = function (element: Element) {
    Attr.set(element, attribute, value);
  };

  return {
    is,
    remove,
    set,
  };
};