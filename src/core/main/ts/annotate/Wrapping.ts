import { Range } from '@ephox/dom-globals';
import { Arr, Cell, Id, Option } from '@ephox/katamari';
import { Attr, Class, Classes, Element, Insert, Node, Replication, Traverse } from '@ephox/sugar';
import { AnnotatorSettings } from 'tinymce/core/annotate/AnnotationsRegistry';
import { Editor } from 'tinymce/core/api/Editor';
import GetBookmark from 'tinymce/core/bookmark/GetBookmark';
import ExpandRange from 'tinymce/core/fmt/ExpandRange';

import RangeWalk from '../selection/RangeWalk';
import { ChildContext, context } from './AnnotationContext';
import * as Markings from './Markings';

export type DecoratorData = Record<string, any>;

export type Decorator = (
  uid: string,
  data: DecoratorData
) => {
  attributes?: { },
  classes?: string[]
};

const applyWordGrab = (editor: Editor, rng: Range): void => {
  const r = ExpandRange.expandRng(editor, rng, [{ inline: true }], false);
  rng.setStart(r.startContainer, r.startOffset);
  rng.setEnd(r.endContainer, r.endOffset);
  editor.selection.setRng(rng);
};

const annotate = (editor: Editor, rng: Range, annotationName: string, decorate: Decorator, { uid = Id.generate('mce-annotation'), ...data }): any[] => {
  // Setup all the wrappers that are going to be used.
  const newWrappers = [ ];

  // Setup the spans for the comments
  const master = Element.fromTag('span');
  Class.add(master, Markings.annotation());
  Attr.set(master, `${Markings.dataAnnotationId()}`, uid);
  Attr.set(master, `${Markings.dataAnnotation()}`, annotationName);

  const { attributes = { }, classes = [ ] } = decorate(uid, data);
  Attr.setAll(master, attributes);
  Classes.add(master, classes);

  // Set the current wrapping element
  const wrapper = Cell(Option.none());

  // Clear the current wrapping element, so that subsequent calls to
  // getOrOpenWrapper spawns a new one.
  const finishWrapper = () => {
    wrapper.set(Option.none());
  };

  // Get the existing wrapper, or spawn a new one.
  const getOrOpenWrapper = () => {
    return wrapper.get().getOrThunk(() => {
      const nu = Replication.shallow(master);
      newWrappers.push(nu);
      wrapper.set(Option.some(nu));
      return nu;
    });
  };

  const processElements = (elems) => {
    Arr.each(elems, processElement);
  };

  const processElement = (elem) => {
    const ctx = context(editor, elem, 'span', Node.name(elem));

    switch (ctx) {
      case ChildContext.InvalidChild: {
        finishWrapper();
        const children = Traverse.children(elem);
        processElements(children);
        finishWrapper();
        break;
      }

      case ChildContext.Valid: {
        const w = getOrOpenWrapper();
        Insert.wrap(elem, w);
        break;
      }

      // INVESTIGATE: Are these sensible things to do?
      case ChildContext.Skipping:
      case ChildContext.Existing:
      case ChildContext.Caret: {
        // Do nothing.
      }
    }
  };

  const processNodes = (nodes) => {
    const elems = Arr.map(nodes, Element.fromDom);
    processElements(elems);
  };

  RangeWalk.walk(editor.dom, rng, (nodes) => {
    finishWrapper();
    processNodes(nodes);
  });

  return newWrappers;
};

const annotateWithBookmark = (editor: Editor, name: string, settings: AnnotatorSettings, data: { }): void => {
  editor.undoManager.transact(() => {
    const initialRng = editor.selection.getRng();
    if (initialRng.collapsed) {
      applyWordGrab(editor, initialRng);
    }
    // The bookmark is responsible for splitting the nodes beforehand at the selection points
    const bookmark = GetBookmark.getPersistentBookmark(editor.selection, true);
    const rng = editor.selection.getRng();
    annotate(editor, rng, name, settings.decorate, data);
    editor.selection.moveToBookmark(bookmark);
  });
};

export {
  annotateWithBookmark
};