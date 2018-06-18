import { Arr, Option } from '@ephox/katamari';
import { Attr, Class, Compare, Element, Node, SelectorFilter, SelectorFind, Traverse } from '@ephox/sugar';

import * as Markings from './Markings';
import { Editor } from 'tinymce/core/api/Editor';

// Given the current editor selection, identify the uid of any current
// annotation
const identify = (editor: Editor, annotationName: Option<string>): Option<{uid: string, name: string}> => {
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
        uid, name
      }))
    );
  });
};

const isAnnotation = (elem: any): boolean => {
  return Node.isElement(elem) && Class.has(elem, Markings.annotation());
};

// Update the 'mce-active-annotation' to only be on an annotation that is
// currently selected
const updateActive = (editor: Editor, name: string, optUid: Option<string>): void => {
  const allMarkers = SelectorFilter.descendants(
    // Using classes because they are faster?
    Element.fromDom(editor.getBody()),
    '.' + Markings.annotation()
  );

  Arr.each(allMarkers, (m) => {
    const isCurrent = optUid.exists((uid) =>
      Attr.get(m, `${Markings.dataAnnotationId()}`) === uid && Attr.get(m, `${Markings.dataAnnotation()}`) === name);
    const f = isCurrent ? Class.add : Class.remove;
    f(m, Markings.activeAnnotation());
  });
};

const findMarkers = (editor: Editor, uid: string): any[] => {
  const body = Element.fromDom(editor.getBody());
  return SelectorFilter.descendants(body, `[${Markings.dataAnnotationId()}="${uid}"]`);
};

export {
  identify,
  isAnnotation,
  updateActive,
  findMarkers
};