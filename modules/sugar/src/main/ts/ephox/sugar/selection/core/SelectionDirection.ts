import { Node as DomNode, Range, Window } from '@ephox/dom-globals';
import { Adt, Fun, Option, Thunk } from '@ephox/katamari';
import Element from '../../api/node/Element';
import { Selection } from '../../api/selection/Selection';
import * as NativeRange from './NativeRange';

type SelectionDirectionHandler<U> = (start: Element<DomNode>, soffset: number, finish: Element<DomNode>, foffset: number) => U;

export interface SelectionDirection {
  fold: <U> (
    ltr: SelectionDirectionHandler<U>,
    rtl: SelectionDirectionHandler<U>
  ) => U;
  match: <U> (branches: {
    ltr: SelectionDirectionHandler<U>;
    rtl: SelectionDirectionHandler<U>;
  }) => U;
  log: (label: string) => void;
}

type SelectionDirectionConstructor = (start: Element<DomNode>, soffset: number, finish: Element<DomNode>, foffset: number) => SelectionDirection;

const adt: {
  ltr: SelectionDirectionConstructor;
  rtl: SelectionDirectionConstructor;
} = Adt.generate([
  { ltr: [ 'start', 'soffset', 'finish', 'foffset' ] },
  { rtl: [ 'start', 'soffset', 'finish', 'foffset' ] }
]);

const fromRange = (win: Window, type: SelectionDirectionConstructor, range: Range) =>
  type(Element.fromDom(range.startContainer), range.startOffset, Element.fromDom(range.endContainer), range.endOffset);

interface LtrRtlRanges {
  ltr: () => Range;
  rtl: () => Option<Range>;
}

const getRanges = (win: Window, selection: Selection): LtrRtlRanges => selection.match<LtrRtlRanges>({
  domRange(rng) {
    return {
      ltr: Fun.constant(rng),
      rtl: Option.none
    };
  },
  relative(startSitu, finishSitu) {
    return {
      ltr: Thunk.cached(() => NativeRange.relativeToNative(win, startSitu, finishSitu)),
      rtl: Thunk.cached(() => Option.some(NativeRange.relativeToNative(win, finishSitu, startSitu)))
    };
  },
  exact(start: Element<DomNode>, soffset: number, finish: Element<DomNode>, foffset: number) {
    return {
      ltr: Thunk.cached(() => NativeRange.exactToNative(win, start, soffset, finish, foffset)),
      rtl: Thunk.cached(() => Option.some(NativeRange.exactToNative(win, finish, foffset, start, soffset)))
    };
  }
});

const doDiagnose = (win: Window, ranges: LtrRtlRanges) => {
  // If we cannot create a ranged selection from start > finish, it could be RTL
  const rng = ranges.ltr();
  if (rng.collapsed) {
    // Let's check if it's RTL ... if it is, then reversing the direction will not be collapsed
    const reversed = ranges.rtl().filter((rev) => rev.collapsed === false);

    return reversed.map((rev) =>
      // We need to use "reversed" here, because the original only has one point (collapsed)
      adt.rtl(
        Element.fromDom(rev.endContainer), rev.endOffset,
        Element.fromDom(rev.startContainer), rev.startOffset
      )
    ).getOrThunk(() => fromRange(win, adt.ltr, rng));
  } else {
    return fromRange(win, adt.ltr, rng);
  }
};

const diagnose = (win: Window, selection: Selection) => {
  const ranges = getRanges(win, selection);
  return doDiagnose(win, ranges);
};

const asLtrRange = (win: Window, selection: Selection) => {
  const diagnosis = diagnose(win, selection);
  return diagnosis.match({
    ltr: (start, soffset, finish, foffset): Range => {
      const rng = win.document.createRange();
      rng.setStart(start.dom(), soffset);
      rng.setEnd(finish.dom(), foffset);
      return rng;
    },
    rtl: (start, soffset, finish, foffset) => {
      // NOTE: Reversing start and finish
      const rng = win.document.createRange();
      rng.setStart(finish.dom(), foffset);
      rng.setEnd(start.dom(), soffset);
      return rng;
    }
  });
};

const ltr = adt.ltr;
const rtl = adt.rtl;

export { ltr, rtl, diagnose, asLtrRange };
