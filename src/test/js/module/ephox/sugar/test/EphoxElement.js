import Element from 'ephox/sugar/api/node/Element';



export default <any> function (type) {
  var dom = document.createElement(type);
  return Element.fromDom(dom);
};