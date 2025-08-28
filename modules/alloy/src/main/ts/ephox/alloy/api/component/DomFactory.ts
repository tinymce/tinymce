import { Arr } from '@ephox/katamari';
import { Html, SugarElement, SugarNode, Traverse } from '@ephox/sugar';

import { AlloySpec, RawDomSchema, SimpleSpec, SketchSpec } from './SpecTypes';

const getAttrs = (elem: SugarElement<Element>): Record<string, string> => {
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

const getClasses = (elem: SugarElement<Element>): string[] =>
  Array.prototype.slice.call(elem.dom.classList, 0);

const fromHtml = (html: string): RawDomSchema => {
  const elem = SugarElement.fromHtml<HTMLElement>(html);

  const children = Traverse.children(elem);
  const attrs = getAttrs(elem);
  const classes = getClasses(elem);
  const contents = children.length === 0 ? { } : { innerHtml: Html.get(elem) };

  return {
    tag: SugarNode.name(elem),
    classes,
    attributes: attrs,
    ...contents
  };
};

const sketch = <T>(sketcher: { sketch: (spec: { dom: RawDomSchema } & T) => SketchSpec }, html: string, config: T): SketchSpec =>
  sketcher.sketch({
    dom: fromHtml(html),
    ...config
  });

const dom = (tag: string, classes: string[], attributes = { }, styles = { }): RawDomSchema => ({
  tag,
  classes,
  attributes,
  styles
});

const simple = (tag: string, classes: string[], components: AlloySpec[]): SimpleSpec => ({
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
