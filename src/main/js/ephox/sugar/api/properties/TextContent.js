// REQUIRES IE9
var get = function (element) {
  return element.dom().textContent;
};

var set = function (element, value) {
  element.dom().textContent = value;
};

export default <any> {
  get: get,
  set: set
};