import { Bounds, Boxes } from '@ephox/alloy';
import { Arr, Optional, Strings } from '@ephox/katamari';
import { Css, PredicateFilter, SugarElement, SugarNode } from '@ephox/sugar';

import Editor from 'tinymce/core/api/Editor';

import * as Options from '../api/Options';

export interface ScrollingContext {
  readonly element: SugarElement<HTMLElement>;
  readonly others: SugarElement<HTMLElement>[];
}

// TINY-9385: Investigate exactly what makes an element possibly
// scrollable. This approach does not seem exhaustive. What about:
// overflow-x, overflow-y etc.
const nonScrollingOverflows = [ 'visible', 'hidden' ];

export const isScroller = (elem: SugarElement<Node> | any): boolean => {
  if (SugarNode.isHTMLElement(elem)) {
    const overflow = Css.get(elem, 'overflow');
    return Strings.trim(overflow).length > 0 && !Arr.contains(nonScrollingOverflows, overflow);
  } else {
    return false;
  }
};

// NOTE: Calculating the list of scrolling ancestors each time this function is called might
// be unnecessary. It will depend on its usage.
export const detect = (poupSinkElem: SugarElement<HTMLElement>): Optional<ScrollingContext> => {
  // We don't want to include popupSinkElem in the list of scrollers, so we just use "ancestors"
  const scrollers: SugarElement<HTMLElement>[] = PredicateFilter.ancestors(poupSinkElem, isScroller) as SugarElement<HTMLElement>[];

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
