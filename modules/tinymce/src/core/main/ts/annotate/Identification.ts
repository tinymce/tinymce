/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Arr, Option } from '@ephox/katamari';
import { Attr, Class, Compare, Element, Node, SelectorFilter, SelectorFind, Traverse } from '@ephox/sugar';
import Editor from '../api/Editor';

import * as Markings from './Markings';

// Given the current editor selection, identify the uid of any current
// annotation
const identify = (editor: Editor, annotationName: Option<string>): Option<{uid: string; name: string; elements: any[]}> => {
  const rng = editor.selection.getRng();

  const start = Element.fromDom(rng.startContainer);
  const root = Element.fromDom(editor.getBody());

  const selector = annotationName.fold(
    () => '.' + Markings.annotation(),
    (an) => `[${Markings.dataAnnotation()}="${an}"]`
  );

  const newStart = Traverse.child(start, rng.startOffset).getOr(start);
  const closest = SelectorFind.closest(newStart, selector, (n) => Compare.eq(n, root));

  const getAttr = (c, property: string): Option<any> => {
    if (Attr.has(c, property)) {
      return Option.some(Attr.get(c, property));
    } else {
      return Option.none();
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

const isAnnotation = (elem: any): boolean => Node.isElement(elem) && Class.has(elem, Markings.annotation());

const findMarkers = (editor: Editor, uid: string): any[] => {
  const body = Element.fromDom(editor.getBody());
  return SelectorFilter.descendants(body, `[${Markings.dataAnnotationId()}="${uid}"]`);
};

const findAll = (editor: Editor, name: string): Record<string, Element[]> => {
  const body = Element.fromDom(editor.getBody());
  const markers = SelectorFilter.descendants(body, `[${Markings.dataAnnotation()}="${name}"]`);
  const directory: Record<string, Element[]> = { };
  Arr.each(markers, (m) => {
    const uid = Attr.get(m, Markings.dataAnnotationId());
    const nodesAlready = directory.hasOwnProperty(uid) ? directory[uid] : [ ];
    directory[uid] = nodesAlready.concat([ m ]);
  });
  return directory;
};

export {
  identify,
  isAnnotation,
  findAll
};