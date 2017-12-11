import Element from '../node/Element';
import Elements from '../node/Elements';
import Insert from '../dom/Insert';
import InsertAll from '../dom/InsertAll';
import Remove from '../dom/Remove';
import Traverse from '../search/Traverse';

var get = function (element) {
  return element.dom().innerHTML;
};

var set = function (element, content) {
  var owner = Traverse.owner(element);
  var docDom = owner.dom();

  // FireFox has *terrible* performance when using innerHTML = x
  var fragment = Element.fromDom(docDom.createDocumentFragment());
  var contentElements = Elements.fromHtml(content, docDom);
  InsertAll.append(fragment, contentElements);

  Remove.empty(element);
  Insert.append(element, fragment);
};

var getOuter = function (element) {
  var container = Element.fromTag('div');
  var clone = Element.fromDom(element.dom().cloneNode(true));
  Insert.append(container, clone);
  return get(container);
};

export default <any> {
  get: get,
  set: set,
  getOuter: getOuter
};