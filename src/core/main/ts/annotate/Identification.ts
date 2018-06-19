import { Option, Arr } from '@ephox/katamari';
import { Attr, Class, Compare, Element, Node, SelectorFilter, SelectorFind, Traverse } from '@ephox/sugar';
import { Editor } from 'tinymce/core/api/Editor';

import * as Markings from './Markings';

// Given the current editor selection, identify the uid of any current
// annotation
const identify = (editor: Editor, annotationName: Option<string>): Option<{uid: string, name: string, element: any}> => {
  const rng = editor.selection.getRng();

  const start = Element.fromDom(rng.startContainer);
  const root = Element.fromDom(editor.getBody());

  const selector = annotationName.fold(
    () => '.' + Markings.annotation(),
    (an) => `[${Markings.dataAnnotation()}="${an}"]`
  );

  const newStart = Traverse.child(start, rng.startOffset).getOr(start);
  const closest = SelectorFind.closest(newStart, selector, (n) => {
    return Compare.eq(n, root);
  });

  const getAttr = (c, property: string): Option<any> => {
    if (Attr.has(c, property)) {
      return Option.some(Attr.get(c, property));
    } else {
      return Option.none();
    }
  };

  return closest.bind((c) => {
    return getAttr(c, `${Markings.dataAnnotationId()}`).bind(
      (uid) => getAttr(c, `${Markings.dataAnnotation()}`).map((name) => ({
        uid, name, element: c
      }))
    );
  });
};

const isAnnotation = (elem: any): boolean => {
  return Node.isElement(elem) && Class.has(elem, Markings.annotation());
};

const findMarkers = (editor: Editor, uid: string): any[] => {
  const body = Element.fromDom(editor.getBody());
  return SelectorFilter.descendants(body, `[${Markings.dataAnnotationId()}="${uid}"]`);
};

const findAll = (editor: Editor, name: string): Record<string, any> => {
  const body = Element.fromDom(editor.getBody());
  const markers = SelectorFilter.descendants(body, `[${Markings.dataAnnotation()}="${name}"]`);
  const directory = { };
  Arr.each(markers, (m) => {
    const uid = Attr.get(m, Markings.dataAnnotationId());
    directory[uid] = m;
  });
  return directory;
};

export {
  identify,
  isAnnotation,
  findMarkers,
  findAll
};