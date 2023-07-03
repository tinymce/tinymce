import { Bounds, Boxes } from '@ephox/alloy';
import { Arr, Optional, Strings } from '@ephox/katamari';
import { Css, PredicateFilter, SugarElement, SugarNode, SugarShadowDom } from '@ephox/sugar';

import Editor from 'tinymce/core/api/Editor';

import * as Options from '../api/Options';

export interface ScrollingContext {
  readonly element: SugarElement<HTMLElement>;
  readonly others: SugarElement<HTMLElement>[];
}

// See https://developer.mozilla.org/en-US/docs/Glossary/Scroll_container for what makes an element scrollable
const nonScrollingOverflows = [ 'visible', 'hidden', 'clip' ];

const isScrollingOverflowValue = (value: string): boolean =>
  Strings.trim(value).length > 0 && !Arr.contains(nonScrollingOverflows, value);

export const isScroller = (elem: SugarElement<Node> | any): boolean => {
  if (SugarNode.isHTMLElement(elem)) {
    const overflowX = Css.get(elem, 'overflow-x');
    const overflowY = Css.get(elem, 'overflow-y');
    return isScrollingOverflowValue(overflowX) || isScrollingOverflowValue(overflowY);
  } else {
    return false;
  }
};

// NOTE: Calculating the list of scrolling ancestors each time this function is called might
// be unnecessary. It will depend on its usage.
export const detect = (popupSinkElem: SugarElement<HTMLElement>): Optional<ScrollingContext> => {
  const ancestorsScrollers = PredicateFilter.ancestors(popupSinkElem, isScroller) as SugarElement<HTMLElement>[];

  // If there is no scrollable container, we try to see if it's in a shadow root, and try to traverse beyond the host of shadow root to retrieve the scrollable container
  // If it is not within a ShadowRoot, since if there's a scrollable container as the ancestors, then it would not execute the code below, or return an empty array if it's not in a ShadowRoot
  const scrollers = ancestorsScrollers.length === 0
    ? SugarShadowDom.getShadowRoot(popupSinkElem).map(SugarShadowDom.getShadowHost).map((x) => PredicateFilter.ancestors(x, isScroller)).getOr([]) as SugarElement<HTMLElement>[]
    : ancestorsScrollers;

  return Arr.head(scrollers)
    .map(
      (element) => ({
        element,
        // A list of all scrolling elements above the nearest scroller,
        // ordered from closest to popup -> closest to top of document
        others: scrollers.slice(1)
      })
    );
};

export const detectWhenSplitUiMode = (editor: Editor, popupSinkElem: SugarElement<HTMLElement>): Optional<ScrollingContext> =>
  Options.isSplitUiMode(editor) ? detect(popupSinkElem) : Optional.none();

// Using all the scrolling viewports in the ancestry, limit the absolute
// coordinates of window so that the bounds are limited by all the scrolling
// viewports.
export const getBoundsFrom = (sc: ScrollingContext): Bounds => {
  const scrollableBoxes = [
    // sc.element is the main scroller, others are *additional* scrollers above that
    // we need to combine all of them to constrain the bounds
    ...Arr.map(sc.others, Boxes.box),
    Boxes.win()
  ];

  return Boxes.constrainByMany(
    Boxes.box(sc.element),
    scrollableBoxes
  );
};
