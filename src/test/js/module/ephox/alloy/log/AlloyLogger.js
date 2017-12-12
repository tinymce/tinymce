// Used for atomic testing where window is not available.
var element = function (elem) {
  return elem;
};

export default <any> {
  element: element
};