import { Objects } from '@ephox/boulder';
import { Arr, Merger, Obj, Result, Option } from '@ephox/katamari';
import { Element, Node, Text, Traverse } from '@ephox/sugar';
import { RawDomSchema, SimpleOrSketchSpec } from '../../api/component/SpecTypes';

const getAttrs = (elem) => {
  const attributes = elem.dom().attributes !== undefined ? elem.dom().attributes : [ ];
  return Arr.foldl(attributes, (b, attr) => {
    // Make class go through the class path. Do not list it as an attribute.
    if (attr.name === 'class') { return b; } else { return Merger.deepMerge(b, Objects.wrap(attr.name, attr.value)); }
  }, {});
};

const getClasses = (elem) => {
  return Array.prototype.slice.call(elem.dom().classList, 0);
};

const readText = (elem) => {
  const text = Text.get(elem);
  return text.trim().length > 0 ? [ { text } ] : [ ];
};

const readChildren = (elem) => {
  if (Node.isText(elem)) { return readText(elem); } else if (Node.isComment(elem)) { return [ ]; } else {
    const attrs = getAttrs(elem);
    const classes = getClasses(elem);
    const children = Traverse.children(elem);

    const components = Arr.bind(children, (child) => {
      if (Node.isText(child)) { return readText(child); } else { return readChildren(child); }
    });

    return [{
      dom: Objects.wrapAll(
        Arr.flatten<any>([
          [ { key: 'tag', value: Node.name(elem) } ],
          Obj.keys(attrs).length > 0 ? [ { key: 'attributes', value: attrs } ] : [ ],
          classes.length > 0 ? [ { key: 'classes', value: classes } ] : [ ]
        ])
      ),
      components
    }];
  }
};

const read = (elem): SimpleOrSketchSpec => {
  const attrs = getAttrs(elem);
  const classes = getClasses(elem);

  const children = Traverse.children(elem);

  const components = Arr.bind(children, (child) => {
    return readChildren(child);
  }) as SimpleOrSketchSpec[];

  return {
    dom: Objects.wrapAll(
      Arr.flatten<any>([
        [ { key: 'tag', value: Node.name(elem) } ],
        Obj.keys(attrs).length > 0 ? [ { key: 'attributes', value: attrs } ] : [ ],
        classes.length > 0 ? [ { key: 'classes', value: classes } ] : [ ]
      ])
    ) as RawDomSchema,
    components
  };
};

const readHtml = (html: string): Result<SimpleOrSketchSpec, string> => {
  const elem = Element.fromHtml(html);
  return Node.isText(elem) ? Result.error('Template text must contain an element!') : Result.value(
    read(elem)
  );
};

export {
  readHtml
};