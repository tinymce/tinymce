import { Arr } from '@ephox/katamari';
import Element from './Element';
import Traverse from '../search/Traverse';
import { document } from '@ephox/dom-globals';

var fromHtml = function (html, scope) {
  var doc = scope || document;
  var div = doc.createElement('div');
  div.innerHTML = html;
  return Traverse.children(Element.fromDom(div));
};

var fromTags = function (tags, scope) {
  return Arr.map(tags, function (x) {
    return Element.fromTag(x, scope);
  });
};

var fromText = function (texts, scope) {
  return Arr.map(texts, function (x) {
    return Element.fromText(x, scope);
  });
};

var fromDom = function (nodes) {
  return Arr.map(nodes, Element.fromDom);
};

export default <any> {
  fromHtml: fromHtml,
  fromTags: fromTags,
  fromText: fromText,
  fromDom: fromDom
};