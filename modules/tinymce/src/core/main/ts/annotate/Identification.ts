import { Arr, Obj, Optional } from '@ephox/katamari';
import { Attribute, Class, Compare, SelectorExists, SelectorFilter, SelectorFind, SugarElement, SugarNode, Traverse } from '@ephox/sugar';

import Editor from '../api/Editor';
import * as Markings from './Markings';

const isRoot = (root: SugarElement<Node>) => (node: SugarElement<Node>) =>
  Compare.eq(node, root);

// Given the current editor selection, identify the uid of any current
// annotation
const identify = (editor: Editor, annotationName: Optional<string>): Optional<{ uid: string; name: string; elements: any[] }> => {
  const rng = editor.selection.getRng();

  const start = SugarElement.fromDom(rng.startContainer);
  const root = SugarElement.fromDom(editor.getBody());

  const selector = annotationName.fold(
    () => '.' + Markings.annotation(),
    (an) => `[${Markings.dataAnnotation()}="${an}"]`
  );

  const newStart = Traverse.child(start, rng.startOffset).getOr(start);
  const closest = SelectorFind.closest(newStart, selector, isRoot(root));

  const getAttr = (c, property: string): Optional<any> => {
    if (Attribute.has(c, property)) {
      return Optional.some(Attribute.get(c, property));
    } else {
      return Optional.none();
    }
  };

  return closest.bind((c) => getAttr(c, `${Markings.dataAnnotationId()}`).bind((uid) =>
    getAttr(c, `${Markings.dataAnnotation()}`).map((name) => {
      const elements = findMarkers(editor, uid);
      return {
        uid,
        name,
        elements
      };
    })
  ));
};

const isAnnotation = (elem: any): boolean => SugarNode.isElement(elem) && Class.has(elem, Markings.annotation());

const isBogusElement = (elem: SugarElement<Node>, root: SugarElement<Node>) =>
  Attribute.has(elem, 'data-mce-bogus') || SelectorExists.ancestor(elem, '[data-mce-bogus="all"]', isRoot(root));

const findMarkers = (editor: Editor, uid: string): Array<SugarElement<Element>> => {
  const body = SugarElement.fromDom(editor.getBody());
  const descendants = SelectorFilter.descendants(body, `[${Markings.dataAnnotationId()}="${uid}"]`);
  return Arr.filter(descendants, (descendant) => !isBogusElement(descendant, body));
};

const findAll = (editor: Editor, name: string): Record<string, SugarElement[]> => {
  const body = SugarElement.fromDom(editor.getBody());
  const markers = SelectorFilter.descendants(body, `[${Markings.dataAnnotation()}="${name}"]`);
  const directory: Record<string, SugarElement[]> = {};
  Arr.each(markers, (m) => {
    if (!isBogusElement(m, body)) {
      const uid = Attribute.get(m, Markings.dataAnnotationId());
      const nodesAlready = Obj.get(directory, uid).getOr([]);
      directory[uid] = nodesAlready.concat([ m ]);
    }
  });
  return directory;
};

export {
  identify,
  isAnnotation,
  findMarkers,
  findAll
};
