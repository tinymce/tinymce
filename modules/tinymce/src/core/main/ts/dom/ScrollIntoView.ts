import { Fun } from '@ephox/katamari';
import {
  Css, Height, Insert, Remove, Scroll, SugarElement, SugarLocation, SugarNode, SugarPosition, SugarText, Traverse, WindowVisualViewport
} from '@ephox/sugar';

import Editor from '../api/Editor';
import { ScrollIntoViewEvent } from '../api/EventTypes';
import * as OuterPosition from '../frames/OuterPosition';
import * as Zwsp from '../text/Zwsp';

interface MarkerInfo {
  readonly element: SugarElement<HTMLElement>;
  readonly bottom: number;
  readonly height: number;
  readonly pos: SugarPosition;
  readonly cleanup: () => void;
}

type ScrollFunc = (editor: Editor, doc: SugarElement<Document>, scrollTop: number, marker: MarkerInfo, alignToTop?: boolean) => void;

const excludeFromDescend = (element: SugarElement<Node>) => SugarNode.name(element) === 'textarea';

const fireScrollIntoViewEvent = (editor: Editor, data: ScrollIntoViewEvent): boolean => {
  const scrollEvent = editor.dispatch('ScrollIntoView', data);
  return scrollEvent.isDefaultPrevented();
};

const fireAfterScrollIntoViewEvent = (editor: Editor, data: ScrollIntoViewEvent): void => {
  editor.dispatch('AfterScrollIntoView', data);
};

const descend = (element: SugarElement<Node>, offset: number): { element: SugarElement<Node>; offset: number } => {
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
      if (SugarNode.name(last) === 'img') {
        return { element: last, offset: 1 };
      } else if (SugarNode.isText(last)) {
        return { element: last, offset: SugarText.get(last).length };
      } else {
        return { element: last, offset: Traverse.children(last).length };
      }
    }
  }
};

const markerInfo = (element: SugarElement<HTMLElement>, cleanupFun: () => void): MarkerInfo => {
  const pos = SugarLocation.absolute(element);
  const height = Height.get(element);
  return {
    element,
    bottom: pos.top + height,
    height,
    pos,
    cleanup: cleanupFun
  };
};

const createMarker = (element: SugarElement<Node>, offset: number): MarkerInfo => {
  const startPoint = descend(element, offset);
  const span = SugarElement.fromHtml<HTMLSpanElement>('<span data-mce-bogus="all" style="display: inline-block;">' + Zwsp.ZWSP + '</span>');
  Insert.before(startPoint.element, span);

  return markerInfo(span, () => Remove.remove(span));
};

const elementMarker = (element: HTMLElement): MarkerInfo => markerInfo(SugarElement.fromDom(element), Fun.noop);

const withMarker = (editor: Editor, f: ScrollFunc, rng: Range, alignToTop?: boolean) => {
  preserveWith(editor, (_s, _e) => applyWithMarker(editor, f, rng, alignToTop), rng);
};

const withScrollEvents = (editor: Editor, doc: SugarElement<Document>, f: ScrollFunc, marker: MarkerInfo, alignToTop?: boolean) => {
  const data = { elm: marker.element.dom, alignToTop };
  if (fireScrollIntoViewEvent(editor, data)) {
    return;
  }
  const scrollTop = Scroll.get(doc).top;
  f(editor, doc, scrollTop, marker, alignToTop);
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

const preserveWith = (editor: Editor, f: (startElement: SugarElement<Node>, endElement: SugarElement<Node>) => void, rng: Range) => {
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

const scrollToMarker = (editor: Editor, marker: MarkerInfo, viewHeight: number, alignToTop: boolean, doc?: SugarElement<Document>) => {
  const pos = marker.pos;
  const viewWidth = Traverse.defaultView(doc ?? SugarElement.fromDom(editor.getDoc())).dom.innerWidth;
  const viewportLeft = -editor.getBody().getBoundingClientRect().left;
  if (alignToTop) {
    const targetOffset = viewHeight * 0.25;
    const y = pos.top - targetOffset;
    // If element is off screen to the left, scroll to slightly right of its position
    if (pos.left < viewportLeft) {
      Scroll.to(pos.left - 20, y, doc);
    // If element is within first 50% of viewport width, align to left edge
    } else if (pos.left < viewWidth * 0.5) {
      Scroll.to(viewportLeft, y, doc);
    // If element is beyond 50% of viewport width, scroll to its position
    } else if (pos.left > viewWidth) {
      Scroll.to(pos.left, y, doc);
    // If element is beyond 50% of viewport width, scroll to its position
    } else {
      Scroll.to(pos.left, y, doc);
    }
  } else {
    // The position we want to scroll to is the...
    // (absolute position of the marker, minus the view height) plus (the height of the marker)
    const y = (pos.top - viewHeight) + marker.height;
    Scroll.to(viewportLeft, y, doc);
  }
};

const intoWindowIfNeeded = (editor: Editor, doc: SugarElement<Document>, scrollTop: number, viewHeight: number, marker: MarkerInfo, alignToTop?: boolean) => {
  const viewportBottom = viewHeight + scrollTop;
  const markerTop = marker.pos.top;
  const markerBottom = marker.bottom;
  const largerThanViewport = markerBottom - markerTop >= viewHeight * 0.5;

  // Calculate the target position at 25% of viewport height
  const targetPosition = scrollTop + (viewHeight * 0.25);

  // above the screen or needs repositioning to 25%
  if (markerTop < scrollTop || markerTop > targetPosition) {
    scrollToMarker(editor, marker, viewHeight, true, doc);
  // completely below the screen
  } else if (markerTop > viewportBottom) {
    const align = largerThanViewport ? alignToTop !== false : alignToTop === true;
    scrollToMarker(editor, marker, viewHeight, align, doc);
  // partially below the bottom, only scroll if element height is less than viewport
  } else if (markerBottom > viewportBottom && !largerThanViewport) {
    scrollToMarker(editor, marker, viewHeight, alignToTop === true, doc);
  }
};

const intoWindow = (editor: Editor, doc: SugarElement<Document>, scrollTop: number, marker: MarkerInfo, alignToTop?: boolean) => {
  const viewHeight = Traverse.defaultView(doc).dom.innerHeight;
  intoWindowIfNeeded(editor, doc, scrollTop, viewHeight, marker, alignToTop);
};

const intoFrame = (editor: Editor, doc: SugarElement<Document>, scrollTop: number, marker: MarkerInfo, alignToTop?: boolean) => {
  const frameViewHeight = Traverse.defaultView(doc).dom.innerHeight; // height of iframe container

  // If the position is outside the iframe viewport, scroll to it
  intoWindowIfNeeded(editor, doc, scrollTop, frameViewHeight, marker, alignToTop);

  // If the new position is outside the window viewport, scroll to it
  const op = OuterPosition.find(marker.element);
  const viewportBounds = WindowVisualViewport.getBounds(window);
  if (op.top < viewportBounds.y) {
    Scroll.intoView(marker.element, alignToTop !== false);
  } else if (op.top > viewportBounds.bottom) {
    Scroll.intoView(marker.element, alignToTop === true);
  }
};

const rangeIntoWindow = (editor: Editor, rng: Range, alignToTop?: boolean) => withMarker(editor, intoWindow, rng, alignToTop);
const elementIntoWindow = (editor: Editor, element: HTMLElement, alignToTop?: boolean) => withElement(editor, element, intoWindow, alignToTop);

const rangeIntoFrame = (editor: Editor, rng: Range, alignToTop?: boolean) => withMarker(editor, intoFrame, rng, alignToTop);
const elementIntoFrame = (editor: Editor, element: HTMLElement, alignToTop?: boolean) => withElement(editor, element, intoFrame, alignToTop);

const scrollElementIntoView = (editor: Editor, element: HTMLElement, alignToTop?: boolean): void => {
  const scroller = editor.inline ? elementIntoWindow : elementIntoFrame;
  scroller(editor, element, alignToTop);
};

// This method is made to deal with the user pressing enter, it is not useful
// if we want for example scroll in content after a paste event.
const scrollRangeIntoView = (editor: Editor, rng: Range, alignToTop?: boolean): void => {
  const scroller = editor.inline ? rangeIntoWindow : rangeIntoFrame;
  scroller(editor, rng, alignToTop);
};

export {
  scrollElementIntoView,
  scrollRangeIntoView
};
