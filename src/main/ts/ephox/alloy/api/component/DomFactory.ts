import { Objects } from '@ephox/boulder';
import { Arr } from '@ephox/katamari';
import { Merger } from '@ephox/katamari';
import { Element } from '@ephox/sugar';
import { Node } from '@ephox/sugar';
import { Html } from '@ephox/sugar';
import { Traverse } from '@ephox/sugar';

var getAttrs = function (elem) {
  var attributes = elem.dom().attributes !== undefined ? elem.dom().attributes : [ ];
  return Arr.foldl(attributes, function (b, attr) {
    // Make class go through the class path. Do not list it as an attribute.
    if (attr.name === 'class') return b;
    else return Merger.deepMerge(b, Objects.wrap(attr.name, attr.value));
  }, {});
};

var getClasses = function (elem) {
  return Array.prototype.slice.call(elem.dom().classList, 0);
};

var fromHtml = function (html) {
  var elem = Element.fromHtml(html);

  var children = Traverse.children(elem);
  var attrs = getAttrs(elem);
  var classes = getClasses(elem);
  var contents = children.length === 0 ? { } : { innerHtml: Html.get(elem) };

  return Merger.deepMerge({
    tag: Node.name(elem),
    classes: classes,
    attributes: attrs
  }, contents);
};

var sketch = function (sketcher, html, config) {
  return sketcher.sketch(
    Merger.deepMerge({
      dom: fromHtml(html)
    }, config)
  );
};

export default <any> {
  fromHtml: fromHtml,
  sketch: sketch
};