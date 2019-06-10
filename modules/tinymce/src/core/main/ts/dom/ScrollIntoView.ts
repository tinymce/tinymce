/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { HTMLElement, Element, Range, window } from '@ephox/dom-globals';
import { Fun } from '@ephox/katamari';
import { Css, Element as SugarElement, Height, Insert, Location, Node, Position, Remove, Scroll, Text, Traverse } from '@ephox/sugar';
import Editor from '../api/Editor';
import * as OuterPosition from '../frames/OuterPosition';
import Zwsp from '../text/Zwsp';

interface MarkerInfo {
  element: SugarElement;
  bottom: number;
  pos: Position;
  cleanup: () => void;
}

type ScrollFunc = (doc: SugarElement, scrollTop: number, marker: MarkerInfo, alignToTop?: boolean) => void;

const excludeFromDescend = (element: SugarElement) => Node.name(element) === 'textarea';

const descend = (element: SugarElement, offset: number): { element: SugarElement, offset: number } => {
  const children = Traverse.children(element);
  if (children.length === 0 || excludeFromDescend(element)) {
    return { element, offset };
  } else if (offset < children.length && !excludeFromDescend(children[offset])) {
    return { element: children[offset], offset: 0 };
  } else {
    const last = children[children.length - 1];
    if (excludeFromDescend(last)) {
      return { element, offset };
    } else {
      if (Node.name(last) === 'img') {
        return { element: last, offset: 1 };
      } else if (Node.isText(last)) {
        return { element: last, offset: Text.get(last).length };
      } else {
        return { element: last, offset: Traverse.children(last).length };
      }
    }
  }
};

const markerInfo = (element: SugarElement, cleanupFun: () => void): MarkerInfo => {
  const pos = Location.absolute(element);
  const height = Height.get(element);
  return {
    element,
    bottom: pos.top() + height,
    pos,
    cleanup: cleanupFun
  };
};

const createMarker = (element: SugarElement, offset: number): MarkerInfo => {
  const startPoint = descend(element, offset);
  const span = SugarElement.fromHtml('<span data-mce-bogus="all">' + Zwsp.ZWSP + '</span>');
  Insert.before(startPoint.element, span);

  return markerInfo(span, () => Remove.remove(span));
};

const elementMarker = (element: HTMLElement): MarkerInfo => {
  return markerInfo(SugarElement.fromDom(element), Fun.noop);
};

const withMarker = (editor: Editor, f: ScrollFunc, rng: Range, alignToTop?: boolean) => {
  preserveWith(editor, (_s, _e) => applyWithMarker(editor, f, rng, alignToTop), rng);
};

const applyWithMarker = function (editor: Editor, f: ScrollFunc, rng: Range, alignToTop?: boolean) {
  const body = SugarElement.fromDom(editor.getBody());
  const doc = SugarElement.fromDom(editor.getDoc());

  Css.reflow(body);
  const scrollTop = Scroll.get(doc).top();
  const marker = createMarker(SugarElement.fromDom(rng.startContainer), rng.startOffset);
  f(doc, scrollTop, marker, alignToTop);
  marker.cleanup();
};

const withElement = (editor: Editor, element: MarkerInfo, f: ScrollFunc, alignToTop?: boolean) => {
  const doc = SugarElement.fromDom(editor.getDoc());
  const scrollTop = Scroll.get(doc).top();
  f(doc, scrollTop, element, alignToTop);
};

const preserveWith = (editor: Editor, f: (startElement: SugarElement, endElement: SugarElement) => void, rng: Range) => {
  const startElement = rng.startContainer;
  const startOffset = rng.startOffset;

  const endElement = rng.endContainer;
  const endOffset = rng.endOffset;

  f(SugarElement.fromDom(startElement), SugarElement.fromDom(endElement));

  const newRng = editor.dom.createRng();
  newRng.setStart(startElement, startOffset);
  newRng.setEnd(endElement, endOffset);
  editor.selection.setRng(rng);
};

const fireScrollIntoViewEvent = (editor: Editor, elm: Element, alignToTop: boolean): boolean => {
  const scrollEvent = editor.fire('ScrollIntoView', { elm, alignToTop });
  return scrollEvent.isDefaultPrevented();
};

const scrollTo = (marker: MarkerInfo, viewHeight: number, alignToTop: boolean, doc?: SugarElement) => {
  const pos = marker.pos;
  if (alignToTop) {
    Scroll.to(pos.left(), pos.top(), doc);
  } else {
    // The position we want to scroll to is the...
    // (absolute position of the marker, minus the view height) plus (the height of the marker)
    const y = (pos.top() - viewHeight) + (marker.bottom - pos.top());
    Scroll.to(pos.left(), y, doc);
  }
};

const intoWindowIfNeeded = (doc: SugarElement, scrollTop: number, viewHeight: number, marker: MarkerInfo, alignToTop?: boolean) => {
  // above the screen, scroll to top by default
  if (marker.pos.top() < scrollTop) {
    scrollTo(marker, viewHeight, alignToTop !== false, doc);
  // below the screen, scroll to bottom by default
  } else if (marker.bottom > viewHeight + scrollTop) {
    scrollTo(marker, viewHeight, alignToTop === true, doc);
  }
};

const intoWindow = (doc: SugarElement, scrollTop: number, marker: MarkerInfo, alignToTop?: boolean) => {
  const viewHeight = doc.dom().defaultView.innerHeight;
  intoWindowIfNeeded(doc, scrollTop, viewHeight, marker, alignToTop);
};

const intoFrame = (editor: Editor, doc: SugarElement, scrollTop: number, marker: MarkerInfo, alignToTop?: boolean) => {
  const frameViewHeight = doc.dom().defaultView.innerHeight; // height of iframe container

  // If the position is outside the iframe viewport, scroll to it
  intoWindowIfNeeded(doc, scrollTop, frameViewHeight, marker, alignToTop);

  // If the new position is outside the window viewport, scroll to it
  const op = OuterPosition.find(marker.element);
  const viewTop = Scroll.get().top(); // abs top of screen
  const viewBot = window.innerHeight + viewTop; // abs bottom of screen
  if (op.top() < viewTop) {
    Scroll.intoView(marker.element, alignToTop !== false);
  } else if (op.top() > viewBot) {
    Scroll.intoView(marker.element, alignToTop === true);
  }
};

const rangeIntoWindow = (editor: Editor, rng: Range, alignToTop?: boolean) => withMarker(editor, Fun.curry(intoWindow), rng, alignToTop);
const elementIntoWindow = (editor: Editor, element: HTMLElement, alignToTop?: boolean) => withElement(editor, elementMarker(element), Fun.curry(intoWindow), alignToTop);

const rangeIntoFrame = (editor: Editor, rng: Range, alignToTop?: boolean) => withMarker(editor, Fun.curry(intoFrame, editor), rng, alignToTop);
const elementIntoFrame = (editor: Editor, element: HTMLElement, alignToTop?: boolean) => withElement(editor, elementMarker(element), Fun.curry(intoFrame, editor), alignToTop);

const elementIntoView = (editor: Editor, element: HTMLElement, alignToTop?: boolean) => {
  if (fireScrollIntoViewEvent(editor, element, alignToTop)) {
    return;
  }

  const scroller = editor.inline ? elementIntoWindow : elementIntoFrame;
  scroller(editor, element, alignToTop);
};

// This method is made to deal with the user pressing enter, it is not useful
// if we want for example scroll in content after a paste event.
const rangeIntoView = (editor: Editor, rng: Range, alignToTop?: boolean) => {
  const scroller = editor.inline ? rangeIntoWindow : rangeIntoFrame;
  scroller(editor, rng, alignToTop);
};

export default {
  scrollElementIntoView: elementIntoView,
  scrollRangeIntoView: rangeIntoView
};
