import { Option } from '@ephox/katamari';
import { Element } from '@ephox/sugar';

var iframeDoc = function (element) {
  var dom = element.dom();
  try {
    var idoc = dom.contentWindow ? dom.contentWindow.document : dom.contentDocument;
    return idoc !== undefined && idoc !== null ? Option.some(Element.fromDom(idoc)) : Option.none();
  } catch (err) {
    // ASSUMPTION: Permission errors result in an unusable iframe.
    console.log('Error reading iframe: ', dom);
    console.log('Error was: ' + err);
    return Option.none();
  }
};

var doc = function (element) {
  var optDoc = iframeDoc(element);
  return optDoc.fold(function () {
    return element;
  }, function (v) {
    return v;
  });
};

export default <any> {
  doc: doc
};