import { Objects } from '@ephox/boulder';
import { Arr, Merger } from '@ephox/katamari';
import { Element, Html, Node, Traverse } from '@ephox/sugar';
import { EventHandlerConfig } from 'ephox/alloy/api/events/AlloyEvents';

// TODO: relocate me
export interface RawElementSchema {
  tag: string;
  attributes?: {
    [key: string]: any
  };
  styles?: {
    [key: string]: string
  };
  innerHtml?: string;
}

export interface RawDomSchema {
  dom: RawElementSchema;
  events?: EventHandlerConfig;
}

const getAttrs = function (elem) {
  const attributes = elem.dom().attributes !== undefined ? elem.dom().attributes : [ ];
  return Arr.foldl(attributes, function (b, attr) {
    // Make class go through the class path. Do not list it as an attribute.
    if (attr.name === 'class') { return b; } else { return Merger.deepMerge(b, Objects.wrap(attr.name, attr.value)); }
  }, {});
};

const getClasses = function (elem) {
  return Array.prototype.slice.call(elem.dom().classList, 0);
};

const fromHtml = function (html: string): RawElementSchema {
  const elem = Element.fromHtml(html);

  const children = Traverse.children(elem);
  const attrs = getAttrs(elem);
  const classes = getClasses(elem);
  const contents = children.length === 0 ? { } : { innerHtml: Html.get(elem) };

  return Merger.deepMerge({
    tag: Node.name(elem),
    classes,
    attributes: attrs
  }, contents);
};

const sketch = function (sketcher, html, config) {
  return sketcher.sketch(
    Merger.deepMerge({
      dom: fromHtml(html)
    }, config)
  );
};

export {
  fromHtml,
  sketch
};