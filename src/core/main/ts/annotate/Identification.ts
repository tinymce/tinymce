import { Arr, Option } from '@ephox/katamari';
import { Attr, Class, Compare, Element, Node, SelectorFilter, SelectorFind, Traverse } from '@ephox/sugar';

import * as Markings from './Markings';

// import * as Markings from '../style/Markings';

// Given the current editor selection, identify the uid of any current
// annotation
const identify = (editor, annotationName: Option<string>): Option<{uid: string, name: string}> => {
  const rng = editor.selection.getRng();

  const start = Element.fromDom(rng.startContainer);
  const root = Element.fromDom(editor.getBody());

  const selector = annotationName.fold(
    () => '.' + Markings.annotation(),
    (an) => `[data-mce-annotation="${an}"]`
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
    return getAttr(c, 'data-mce-annotation-uid').bind(
      (uid) => getAttr(c, 'data-mce-annotation').map((name) => ({
        uid, name
      }))
    );
  });
};

const isAnnotation = (elem) => {
  return Node.isElement(elem) && Class.has(elem, Markings.annotation());
};

// Update the 'mce-active-annotation' to only be on an annotation that is
// currently selected
const updateActive = (editor: any, optActive: Option<{uid: string, name: string}> => {
  const allMarkers = SelectorFilter.descendants(
    Element.fromDom(editor.getBody()),
    '.' + Markings.annotation()
  );

  Arr.each(allMarkers, (m) => {
    const isCurrent = optActive.exists(({ uid, name }) =>
      Attr.get(m, 'data-mce-annotation-uid') === uid && Attr.get(m, 'data-mce-annotation') === name);
    const f = isCurrent ? Class.add : Class.remove;
    f(m, Markings.activeAnnotation());
  });
};

const findMarkers = (editor, uid) => {
  const body = Element.fromDom(editor.getBody());
  return SelectorFilter.descendants(body, `[data-mce-annotation-uid="${uid}"]`);
};

export {
  identify,
  isAnnotation,
  updateActive,
  findMarkers
};