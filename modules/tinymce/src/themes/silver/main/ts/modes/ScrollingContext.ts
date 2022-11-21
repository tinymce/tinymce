import { Bounds, Boxes } from '@ephox/alloy';
import { Arr, Optional, Strings } from '@ephox/katamari';
import { Css, PredicateFilter, SugarElement, SugarNode } from '@ephox/sugar';

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
  // We don't want to include popuSinkElem in the list of scrollers, so we just use "ancestors"
  const scrollers: SugarElement<HTMLElement>[] = PredicateFilter.ancestors(poupSinkElem, isScroller) as SugarElement<HTMLElement>[];

  const closestScroller = Arr.head(scrollers);
  return closestScroller.map(
    (element) => ({
      element,
      // A list of all scrolling elements above the nearest scroller,
      // ordered from closest to popup -> closest to top of document
      others: scrollers.slice(1)
    })
  );
};

// Using all the scrolling viewports in the ancestry, limit the absolute
// coordinates of window so that the bounds are limited by all the scrolling
// viewports.
export const getBoundsFrom = (sc: ScrollingContext): Bounds => {
  const stencils = [
    ...Arr.map(sc.others, Boxes.box),
    Boxes.win()
  ];
  return Arr.foldl(
    stencils,
    (acc, stencil) => Boxes.constrain(acc, stencil),
    Boxes.box(sc.element)
  );
};
