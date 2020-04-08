/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { HTMLElement, Range, window } from '@ephox/dom-globals';
import { Fun } from '@ephox/katamari';
import { Css, Element as SugarElement, Height, Insert, Location, Node, Position, Remove, Scroll, Text, Traverse, VisualViewport } from '@ephox/sugar';
import Editor from '../api/Editor';
import { ScrollIntoViewEvent } from '../api/EventTypes';
import * as OuterPosition from '../frames/OuterPosition';
import * as Zwsp from '../text/Zwsp';

interface MarkerInfo {
  readonly element: SugarElement;
  readonly bottom: number;
  readonly height: number;
  readonly pos: Position;
  readonly cleanup: () => void;
}

type ScrollFunc = (doc: SugarElement, scrollTop: number, marker: MarkerInfo, alignToTop?: boolean) => void;

const excludeFromDescend = (element: SugarElement) => Node.name(element) === 'textarea';

const fireScrollIntoViewEvent = (editor: Editor, data: ScrollIntoViewEvent): boolean => {
  const scrollEvent = editor.fire('ScrollIntoView', data);
  return scrollEvent.isDefaultPrevented();
};

const fireAfterScrollIntoViewEvent = (editor: Editor, data: ScrollIntoViewEvent): void => {
  editor.fire('AfterScrollIntoView', data);
};

const descend = (element: SugarElement, offset: number): { element: SugarElement; offset: number } => {
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
    height,
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

const elementMarker = (element: HTMLElement): MarkerInfo => markerInfo(SugarElement.fromDom(element), Fun.noop);

const withMarker = (editor: Editor, f: ScrollFunc, rng: Range, alignToTop?: boolean) => {
  preserveWith(editor, (_s, _e) => applyWithMarker(editor, f, rng, alignToTop), rng);
};

const withScrollEvents = (editor: Editor, doc: SugarElement, f: ScrollFunc, marker: MarkerInfo, alignToTop?: boolean) => {
  const data = { elm: marker.element.dom(), alignToTop };
  if (fireScrollIntoViewEvent(editor, data)) {
    return;
  }
  const scrollTop = Scroll.get(doc).top();
  f(doc, scrollTop, marker, alignToTop);
  fireAfterScrollIntoViewEvent(editor, data);
};

const applyWithMarker = (editor: Editor, f: ScrollFunc, rng: Range, alignToTop?: boolean) => {
  const body = SugarElement.fromDom(editor.getBody());
  const doc = SugarElement.fromDom(editor.getDoc());

  Css.reflow(body);
  const marker = createMarker(SugarElement.fromDom(rng.startContainer), rng.startOffset);
  withScrollEvents(editor, doc, f, marker, alignToTop);
  marker.cleanup();
};

const withElement = (editor: Editor, element: HTMLElement, f: ScrollFunc, alignToTop?: boolean) => {
  const doc = SugarElement.fromDom(editor.getDoc());
  withScrollEvents(editor, doc, f, elementMarker(element), alignToTop);
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

const scrollToMarker = (marker: MarkerInfo, viewHeight: number, alignToTop: boolean, doc?: SugarElement) => {
  const pos = marker.pos;
  if (alignToTop) {
    Scroll.to(pos.left(), pos.top(), doc);
  } else {
    // The position we want to scroll to is the...
    // (absolute position of the marker, minus the view height) plus (the height of the marker)
    const y = (pos.top() - viewHeight) + marker.height;
    Scroll.to(pos.left(), y, doc);
  }
};

const intoWindowIfNeeded = (doc: SugarElement, scrollTop: number, viewHeight: number, marker: MarkerInfo, alignToTop?: boolean) => {
  const viewportBottom = viewHeight + scrollTop;
  const markerTop = marker.pos.top();
  const markerBottom = marker.bottom;
  const largerThanViewport = markerBottom - markerTop >= viewHeight;
  // above the screen, scroll to top by default
  if (markerTop < scrollTop) {
    scrollToMarker(marker, viewHeight, alignToTop !== false, doc);
  // completely below the screen. Default scroll to the top if element height is larger
  // than the viewport, otherwise default to scrolling to the bottom
  } else if (markerTop > viewportBottom) {
    const align = largerThanViewport ? alignToTop !== false : alignToTop === true;
    scrollToMarker(marker, viewHeight, align, doc);
  // partially below the bottom, only scroll if element height is less than viewport
  } else if (markerBottom > viewportBottom && !largerThanViewport) {
    scrollToMarker(marker, viewHeight, alignToTop === true, doc);
  }
};

const intoWindow = (doc: SugarElement, scrollTop: number, marker: MarkerInfo, alignToTop?: boolean) => {
  const viewHeight = doc.dom().defaultView.innerHeight;
  intoWindowIfNeeded(doc, scrollTop, viewHeight, marker, alignToTop);
};

const intoFrame = (doc: SugarElement, scrollTop: number, marker: MarkerInfo, alignToTop?: boolean) => {
  const frameViewHeight = doc.dom().defaultView.innerHeight; // height of iframe container

  // If the position is outside the iframe viewport, scroll to it
  intoWindowIfNeeded(doc, scrollTop, frameViewHeight, marker, alignToTop);

  // If the new position is outside the window viewport, scroll to it
  const op = OuterPosition.find(marker.element);
  const viewportBounds = VisualViewport.getBounds(window);
  if (op.top() < viewportBounds.y) {
    Scroll.intoView(marker.element, alignToTop !== false);
  } else if (op.top() > viewportBounds.bottom) {
    Scroll.intoView(marker.element, alignToTop === true);
  }
};

const rangeIntoWindow = (editor: Editor, rng: Range, alignToTop?: boolean) => withMarker(editor, intoWindow, rng, alignToTop);
const elementIntoWindow = (editor: Editor, element: HTMLElement, alignToTop?: boolean) => withElement(editor, element, intoWindow, alignToTop);

const rangeIntoFrame = (editor: Editor, rng: Range, alignToTop?: boolean) => withMarker(editor, intoFrame, rng, alignToTop);
const elementIntoFrame = (editor: Editor, element: HTMLElement, alignToTop?: boolean) => withElement(editor, element, intoFrame, alignToTop);

const scrollElementIntoView = (editor: Editor, element: HTMLElement, alignToTop?: boolean) => {
  const scroller = editor.inline ? elementIntoWindow : elementIntoFrame;
  scroller(editor, element, alignToTop);
};

// This method is made to deal with the user pressing enter, it is not useful
// if we want for example scroll in content after a paste event.
const scrollRangeIntoView = (editor: Editor, rng: Range, alignToTop?: boolean) => {
  const scroller = editor.inline ? rangeIntoWindow : rangeIntoFrame;
  scroller(editor, rng, alignToTop);
};

export {
  scrollElementIntoView,
  scrollRangeIntoView
};
