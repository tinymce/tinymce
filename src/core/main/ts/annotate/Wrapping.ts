import { Arr, Cell, Option } from '@ephox/katamari';
import { Attr, Class, Element, Insert, Node, Remove, Replication, Traverse } from '@ephox/sugar';

import { ChildContext, context } from './AnnotationContext';

// import * as Markings from '../style/Markings';
import { findMarkers } from './Identification';
import GetBookmark from 'tinymce/core/bookmark/GetBookmark';
import RangeWalk from '../selection/RangeWalk';

import * as Markings from './Markings';

// import BookmarkManager from 'tinymce/core/api/dom/BookmarkManager';
// import RangeUtils from 'tinymce/core/api/dom/RangeUtils';

const annotate = (editor, uid, bookmark): any[] => {
  // Setup all the wrappers that are going to be used.
  const newWrappers = [ ];

  // Get the current selection. The bookmark is responsible for splitting the nodes beforehand
  // at the selection points
  const rng = editor.selection.getRng();

  // Setup the spans for the comments
  const master = Element.fromTag('span');
  Class.add(master, Markings.annotation());
  Attr.set(master, 'data-uid', uid);

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

const annotateWithBookmark = (editor, cUid) => {
  const bookmark = GetBookmark.getPersistentBookmark(editor.selection, true);
  annotate(editor, cUid, bookmark);
  editor.selection.moveToBookmark(bookmark);
};

const remove = (editor, cUid) => {
  const wrappers = findMarkers(editor, cUid);
  Arr.each(wrappers, Remove.unwrap);
};

export {
  annotateWithBookmark,
  remove
};