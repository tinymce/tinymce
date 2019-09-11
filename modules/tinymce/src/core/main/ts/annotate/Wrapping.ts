/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Range, Document } from '@ephox/dom-globals';
import { Arr, Cell, Id, Option } from '@ephox/katamari';
import { Attr, Class, Classes, Element, Insert, Node, Replication, Traverse, Html } from '@ephox/sugar';
import { AnnotatorSettings } from './AnnotationsRegistry';
import Editor from '../api/Editor';
import GetBookmark from '../bookmark/GetBookmark';
import ExpandRange from '../fmt/ExpandRange';

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

// We want it to apply to trailing spaces (like removeFormat does) when dealing with non breaking spaces. There
// will likely be other edge cases as well.
const shouldApplyToTrailingSpaces = (rng: Range) => {
  return rng.startContainer.nodeType === 3 && rng.startContainer.nodeValue.length >= rng.startOffset && rng.startContainer.nodeValue[rng.startOffset] === '\u00A0';
};

const applyWordGrab = (editor: Editor, rng: Range): void => {
  const r = ExpandRange.expandRng(editor, rng, [{ inline: true }], shouldApplyToTrailingSpaces(rng));
  rng.setStart(r.startContainer, r.startOffset);
  rng.setEnd(r.endContainer, r.endOffset);
  editor.selection.setRng(rng);
};

const makeAnnotation = (eDoc: Document, { uid = Id.generate('mce-annotation'), ...data }, annotationName: string, decorate: Decorator): Element => {
  const master = Element.fromTag('span', eDoc);
  Class.add(master, Markings.annotation());
  Attr.set(master, `${Markings.dataAnnotationId()}`, uid);
  Attr.set(master, `${Markings.dataAnnotation()}`, annotationName);

  const { attributes = { }, classes = [ ] } = decorate(uid, data);
  Attr.setAll(master, attributes);
  Classes.add(master, classes);
  return master;
};

const annotate = (editor: Editor, rng: Range, annotationName: string, decorate: Decorator, data): any[] => {
  // Setup all the wrappers that are going to be used.
  const newWrappers = [ ];

  // Setup the spans for the comments
  const master = makeAnnotation(editor.getDoc(), data, annotationName, decorate);

  // Set the current wrapping element
  const wrapper = Cell(Option.none<Element<any>>());

  // Clear the current wrapping element, so that subsequent calls to
  // getOrOpenWrapper spawns a new one.
  const finishWrapper = () => {
    wrapper.set(Option.none());
  };

  // Get the existing wrapper, or spawn a new one.
  const getOrOpenWrapper = (): Element<any> =>
    wrapper.get().getOrThunk(() => {
      const nu = Replication.shallow(master);
      newWrappers.push(nu);
      wrapper.set(Option.some(nu));
      return nu;
    });

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

    // Even after applying word grab, we could not find a selection. Therefore,
    // just make a wrapper and insert it at the current cursor
    if (editor.selection.getRng().collapsed)  {
      const wrapper = makeAnnotation(editor.getDoc(), data, name, settings.decorate);
      // Put something visible in the marker
      Html.set(wrapper, '\u00A0');
      editor.selection.getRng().insertNode(wrapper.dom());
      editor.selection.select(wrapper.dom());
    } else {
      // The bookmark is responsible for splitting the nodes beforehand at the selection points
      // The "false" here means a zero width cursor is NOT put in the bookmark. It seems to be required
      // to stop an empty paragraph splitting into two paragraphs. Probably a better way exists.
      const bookmark = GetBookmark.getPersistentBookmark(editor.selection, false);
      const rng = editor.selection.getRng();
      annotate(editor, rng, name, settings.decorate, data);
      editor.selection.moveToBookmark(bookmark);
    }
  });
};

export {
  annotateWithBookmark
};
