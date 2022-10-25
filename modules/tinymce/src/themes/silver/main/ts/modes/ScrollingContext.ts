import { Bounds, Boxes } from '@ephox/alloy';
import { Arr, Optional } from '@ephox/katamari';
import { Css, PredicateFilter, SugarElement, SugarNode } from '@ephox/sugar';

export interface ScrollingContext {
  readonly element: SugarElement<HTMLElement>;
  readonly stencils: Bounds[];
}

export const isScroller = (elem: SugarElement<Node> | any): boolean => {
  // eslint-disable-next-line no-console
  console.log('is ', elem.dom, 'a scroller?', {
    scrollHeight: elem.dom.scrollHeight,
    clientHeight: elem.dom.clientHeight,
    scrollWidth: elem.dom.scrollWidth,
    clientWidth: elem.dom.clientWidth
  });

  if (SugarNode.isHTMLElement(elem)) {
    const overflow = Css.get(elem, 'overflow');

    // If overflow is visible or hidden, then it doesn't matter what the dimensions are.
    // This is simplistic. Overflow-x, overflow-y, various other settings etc.
    if (Arr.contains([ 'visible', 'hidden' ], overflow)) {
      return false;
    } else {
      // What is the most performant way to do this? Does querying sizes trigger unnecessary reflows?
      return elem.dom.scrollHeight > elem.dom.clientHeight ||
      elem.dom.scrollWidth > elem.dom.clientWidth;
    }
  } else {
    return false;
  }
};

// FIX: I think I'll need to split this so that it doesn't have to calculate what is a scroller
// each time, but it does have to get new boxes fro them.
export const detect = (poupSinkElem: SugarElement<HTMLElement>): Optional<ScrollingContext> => {
  // Ignore the popup sink itself
  const scrollers: SugarElement<HTMLElement>[] = PredicateFilter.ancestors(poupSinkElem, isScroller) as any[];

  // eslint-disable-next-line no-console
  console.log('scrollers', scrollers);

  return Arr.head(
    scrollers
  ).fold(
    () => {
      return Optional.none();
    },
    (x) => {
      const element = x;
      const stencils = [
        ...Arr.map(scrollers.slice(1), (elem) => {
          return Boxes.box(elem);
        }),
        Boxes.win()
      ];

      return Optional.some({
        element,
        stencils
      });
    }
  );
};

export const getBoundsFrom = (sc: ScrollingContext): Bounds => {
  return Arr.foldl(
    sc.stencils,
    (acc, stencil) => {
      // eslint-disable-next-line no-console
      console.log({
        acc,
        stencil
      });
      // TODO: Use clamping.
      const left = Math.max(acc.x, stencil.x);
      const top = Math.max(acc.y, stencil.y);
      const right = Math.min(acc.right, stencil.right);
      const bottom = Math.min(acc.bottom, stencil.bottom);
      const width = right - left;
      const height = bottom - top;
      return Boxes.bounds(
        left,
        top,
        width,
        height
      );
    },
    Boxes.box(sc.element)
  );
};
