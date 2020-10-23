import { Arr } from '@ephox/katamari';
import { Html, SugarElement, SugarNode, Traverse } from '@ephox/sugar';

import { AlloySpec, RawDomSchema, SketchSpec } from './SpecTypes';

const getAttrs = (elem: SugarElement) => {
  const attributes = elem.dom.attributes !== undefined ? elem.dom.attributes : [ ];
  return Arr.foldl(attributes, (b, attr) => {
    // Make class go through the class path. Do not list it as an attribute.
    if (attr.name === 'class') {
      return b;
    } else {
      return { ...b, [attr.name]: attr.value };
    }
  }, {});
};

const getClasses = (elem: SugarElement) => Array.prototype.slice.call(elem.dom.classList, 0);

const fromHtml = (html: string): RawDomSchema => {
  const elem = SugarElement.fromHtml(html);

  const children = Traverse.children(elem);
  const attrs = getAttrs(elem);
  const classes = getClasses(elem);
  const contents = children.length === 0 ? { } : { innerHtml: Html.get(elem as SugarElement<HTMLElement>) };

  return {
    tag: SugarNode.name(elem),
    classes,
    attributes: attrs,
    ...contents
  };
};

const sketch = <T>(sketcher: { sketch: (spec: { dom: RawDomSchema } & T) => SketchSpec}, html: string, config: T) => sketcher.sketch({
  dom: fromHtml(html),
  ...config
});

const dom = (tag: string, classes: string[], attributes = { }, styles = { }) => ({
  tag,
  classes,
  attributes,
  styles
});

const simple = (tag: string, classes: string[], components: AlloySpec[]) => ({
  dom: {
    tag,
    classes
  },
  components
});

export {
  getAttrs,
  getClasses,
  fromHtml,
  sketch,
  simple,
  dom
};
