/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Document, Range } from '@ephox/dom-globals';
import { Arr, Cell, Id, Option, Unicode } from '@ephox/katamari';
import { Attr, Class, Classes, Element, Html, Insert, Node, Replication, Traverse } from '@ephox/sugar';
import Editor from '../api/Editor';
import * as ExpandRange from '../fmt/ExpandRange';
import * as RangeWalk from '../selection/RangeWalk';
import * as SelectionUtils from '../selection/SelectionUtils';
import * as TableCellSelection from '../selection/TableCellSelection';
import { ChildContext, context } from './AnnotationContext';
import { AnnotatorSettings } from './AnnotationsRegistry';
import * as Markings from './Markings';

export type DecoratorData = Record<string, any>;

export type Decorator = (
  uid: string,
  data: DecoratorData
) => {
  attributes?: { };
  classes?: string[];
};

const applyWordGrab = (editor: Editor, rng: Range): void => {
  const r = ExpandRange.expandRng(editor, rng, [{ inline: true }]);
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
    const selection = editor.selection;
    const initialRng = selection.getRng();
    const hasFakeSelection = TableCellSelection.getCellsFromEditor(editor).length > 0;

    if (initialRng.collapsed && !hasFakeSelection) {
      applyWordGrab(editor, initialRng);
    }

    // Even after applying word grab, we could not find a selection. Therefore,
    // just make a wrapper and insert it at the current cursor
    if (selection.getRng().collapsed && !hasFakeSelection) {
      const wrapper = makeAnnotation(editor.getDoc(), data, name, settings.decorate);
      // Put something visible in the marker
      Html.set(wrapper, Unicode.nbsp);
      selection.getRng().insertNode(wrapper.dom());
      selection.select(wrapper.dom());
    } else {
      // The bookmark is responsible for splitting the nodes beforehand at the selection points
      // The "false" here means a zero width cursor is NOT put in the bookmark. It seems to be required
      // to stop an empty paragraph splitting into two paragraphs. Probably a better way exists.
      SelectionUtils.preserve(selection, false, () => {
        SelectionUtils.runOnRanges(editor, (selectionRng) => {
          annotate(editor, selectionRng, name, settings.decorate, data);
        });
      });
    }
  });
};

export {
  annotateWithBookmark
};
