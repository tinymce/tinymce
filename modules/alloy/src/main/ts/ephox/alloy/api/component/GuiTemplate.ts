import { Text as DomText, Node as DomNode } from '@ephox/dom-globals';
import { Arr, Obj, Result } from '@ephox/katamari';
import { Element, Node, Text, Traverse } from '@ephox/sugar';

import { SimpleOrSketchSpec } from '../../api/component/SpecTypes';
import { getAttrs, getClasses } from './DomFactory';

// TODO: This looks to be incorrect and needs fixing, as { text: '' } isn't a valid spec
// for now though lets just cast the types
const readText = (elem: Element<DomText>) => {
  const text = Text.get(elem);
  return text.trim().length > 0 ? [ { text } ] as unknown as SimpleOrSketchSpec[] : [ ];
};

const readChildren = (elem: Element<DomNode>): SimpleOrSketchSpec[] => {
  if (Node.isText(elem)) {
    return readText(elem);
  } else if (Node.isComment(elem)) {
    return [ ];
  } else {
    const attributes = getAttrs(elem);
    const classes = getClasses(elem);
    const children = Traverse.children(elem);

    const components = Arr.bind(children, (child) => {
      return Node.isText(child) ? readText(child) : readChildren(child);
    });

    return [{
      dom: {
        tag: Node.name(elem),
        ...(!Obj.isEmpty(attributes) ? {attributes} : {}),
        ...(classes.length > 0 ? {classes} : {})
      },
      components
    }];
  }
};

const read = (elem: Element<DomNode>): SimpleOrSketchSpec => {
  const attributes = getAttrs(elem);
  const classes = getClasses(elem);

  const children = Traverse.children(elem);

  const components = Arr.bind(children, (child) => {
    return readChildren(child);
  });

  return {
    dom: {
      tag: Node.name(elem),
      ...(!Obj.isEmpty(attributes) ? {attributes} : {}),
      ...(classes.length > 0 ? {classes} : {})
    },
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
