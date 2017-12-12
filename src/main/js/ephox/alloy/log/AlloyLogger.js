import Truncate from '../alien/Truncate';

var element = function (elem) {
  return Truncate.getHtml(elem);
};

export default <any> {
  element: element
};