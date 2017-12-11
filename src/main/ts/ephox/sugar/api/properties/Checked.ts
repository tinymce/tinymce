import SelectorFind from '../search/SelectorFind';

var set = function (element, status) {
  element.dom().checked = status;
};

var find = function (parent) {
  // :checked selector requires IE9
  // http://www.quirksmode.org/css/selectors/#t60
  return SelectorFind.descendant(parent, 'input:checked');
};

export default <any> {
  set: set,
  find: find
};