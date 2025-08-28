import { Arr, Obj, Result } from '@ephox/katamari';
import { SugarElement, SugarNode, SugarText, Traverse } from '@ephox/sugar';

import { getAttrs, getClasses } from './DomFactory';
import { SimpleOrSketchSpec } from './SpecTypes';

// TODO: This looks to be incorrect and needs fixing, as { text: '' } isn't a valid spec
// for now though lets just cast the types
const readText = (elem: SugarElement<Text>) => {
  const text = SugarText.get(elem);
  return text.trim().length > 0 ? [{ text }] as unknown as SimpleOrSketchSpec[] : [ ];
};

const readChildren = (elem: SugarElement<Node>): SimpleOrSketchSpec[] => {
  if (SugarNode.isText(elem)) {
    return readText(elem);
  } else if (SugarNode.isComment(elem)) {
    return [ ];
  } else if (SugarNode.isElement(elem)) {
    const attributes = getAttrs(elem);
    const classes = getClasses(elem);
    const children = Traverse.children(elem);

    const components = Arr.bind(children, (child) => SugarNode.isText(child) ? readText(child) : readChildren(child));

    return [{
      dom: {
        tag: SugarNode.name(elem),
        ...(!Obj.isEmpty(attributes) ? { attributes } : {}),
        ...(classes.length > 0 ? { classes } : {})
      },
      components
    }];
  } else {
    return [ ];
  }
};

const read = (elem: SugarElement<Element>): SimpleOrSketchSpec => {
  const attributes = getAttrs(elem);
  const classes = getClasses(elem);

  const children = Traverse.children(elem);

  const components = Arr.bind(children, (child) => readChildren(child));

  return {
    dom: {
      tag: SugarNode.name(elem),
      ...(!Obj.isEmpty(attributes) ? { attributes } : {}),
      ...(classes.length > 0 ? { classes } : {})
    },
    components
  };
};

const readHtml = (html: string): Result<SimpleOrSketchSpec, string> => {
  const elem = SugarElement.fromHtml(html);
  return SugarNode.isElement(elem) ? Result.value(
    read(elem)
  ) : Result.error('Template text must contain an element!');
};

export {
  readHtml
};
