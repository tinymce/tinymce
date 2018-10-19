import { Objects } from '@ephox/boulder';
import { Arr, Merger } from '@ephox/katamari';
import { Element, Html, Node, Traverse } from '@ephox/sugar';
import { AlloyEventKeyAndHandler } from '../../api/events/AlloyEvents';
import { RawDomSchema, AlloySpec } from '../../api/component/SpecTypes';

const getAttrs = (elem) => {
  const attributes = elem.dom().attributes !== undefined ? elem.dom().attributes : [ ];
  return Arr.foldl(attributes, (b, attr) => {
    // Make class go through the class path. Do not list it as an attribute.
    if (attr.name === 'class') {
      return b;
    } else {
      return { ...b, [attr.name]: attr.value };
    }
  }, {});
};

const getClasses = (elem) => {
  return Array.prototype.slice.call(elem.dom().classList, 0);
};

const fromHtml = (html: string): RawDomSchema => {
  const elem = Element.fromHtml(html);

  const children = Traverse.children(elem);
  const attrs = getAttrs(elem);
  const classes = getClasses(elem);
  const contents = children.length === 0 ? { } : { innerHtml: Html.get(elem) };

  return {
    tag: Node.name(elem),
    classes,
    attributes: attrs,
    ...contents
  };
};

const sketch = (sketcher, html, config) => {
  return sketcher.sketch({
    dom: fromHtml(html),
    ...config
  });
};

const dom = (tag: string, classes: string[], attributes = { }, styles = { }) => {
  return {
    tag,
    classes,
    attributes,
    styles
  }
};

const simple = (tag: string, classes: string[], components: AlloySpec[]) => {
  return {
    dom: {
      tag,
      classes
    },
    components
  };
}

export {
  getAttrs,
  getClasses,
  fromHtml,
  sketch,
  simple,
  dom
};