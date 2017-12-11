// some elements, such as mathml, don't have style attributes
var isSupported = function (dom) {
  return dom.style !== undefined;
};

export default <any> {
  isSupported: isSupported
};