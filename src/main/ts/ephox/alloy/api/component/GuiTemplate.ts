import { Objects } from '@ephox/boulder';
import { Arr, Merger, Obj, Result } from '@ephox/katamari';
import { Element, Node, Text, Traverse } from '@ephox/sugar';

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

const readText = function (elem) {
  const text = Text.get(elem);
  return text.trim().length > 0 ? [ { text } ] : [ ];
};

const readChildren = function (elem) {
  if (Node.isText(elem)) { return readText(elem); } else if (Node.isComment(elem)) { return [ ]; } else {
    const attrs = getAttrs(elem);
    const classes = getClasses(elem);
    const children = Traverse.children(elem);

    const components = Arr.bind(children, function (child) {
      if (Node.isText(child)) { return readText(child); } else { return readChildren(child); }
    });

    return [{
      dom: Objects.wrapAll(
        Arr.flatten([
          [ { key: 'tag', value: Node.name(elem) } ],
          Obj.keys(attrs).length > 0 ? [ { key: 'attributes', value: attrs } ] : [ ],
          classes.length > 0 ? [ { key: 'classes', value: classes } ] : [ ]
        ])
      ),
      components
    }];
  }
};

const read = function (elem) {
  const attrs = getAttrs(elem);
  const classes = getClasses(elem);

  const children = Traverse.children(elem);

  const components = Arr.bind(children, function (child) {
    return readChildren(child);
  });

  return {
    dom: Objects.wrapAll(
      Arr.flatten([
        [ { key: 'tag', value: Node.name(elem) } ],
        Obj.keys(attrs).length > 0 ? [ { key: 'attributes', value: attrs } ] : [ ],
        classes.length > 0 ? [ { key: 'classes', value: classes } ] : [ ]
      ])
    ),
    components
  };
};

const readHtml = function (html) {
  const elem = Element.fromHtml(html);
  return Node.isText(elem) ? Result.error('Template text must contain an element!') : Result.value(
    read(elem)
  );
};

export {
  readHtml
};