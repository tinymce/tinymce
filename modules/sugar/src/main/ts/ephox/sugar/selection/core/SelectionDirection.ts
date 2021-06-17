import { Adt, Fun, Optional, Thunk } from '@ephox/katamari';

import { SugarElement } from '../../api/node/SugarElement';
import { SimSelection } from '../../api/selection/SimSelection';
import * as NativeRange from './NativeRange';

type SelectionDirectionHandler<U> = (start: SugarElement<Node>, soffset: number, finish: SugarElement<Node>, foffset: number) => U;

export interface SelectionDirection {
  readonly fold: <U> (
    ltr: SelectionDirectionHandler<U>,
    rtl: SelectionDirectionHandler<U>
  ) => U;
  readonly match: <U> (branches: {
    ltr: SelectionDirectionHandler<U>;
    rtl: SelectionDirectionHandler<U>;
  }) => U;
  readonly log: (label: string) => void;
}

type SelectionDirectionConstructor = (start: SugarElement<Node>, soffset: number, finish: SugarElement<Node>, foffset: number) => SelectionDirection;

interface LtrRtlRanges {
  readonly ltr: () => Range;
  readonly rtl: () => Optional<Range>;
}

const adt: {
  readonly ltr: SelectionDirectionConstructor;
  readonly rtl: SelectionDirectionConstructor;
} = Adt.generate([
  { ltr: [ 'start', 'soffset', 'finish', 'foffset' ] },
  { rtl: [ 'start', 'soffset', 'finish', 'foffset' ] }
]);

const fromRange = (win: Window, type: SelectionDirectionConstructor, range: Range): SelectionDirection =>
  type(SugarElement.fromDom(range.startContainer), range.startOffset, SugarElement.fromDom(range.endContainer), range.endOffset);

const getRanges = (win: Window, selection: SimSelection): LtrRtlRanges => selection.match<LtrRtlRanges>({
  domRange: (rng) => {
    return {
      ltr: Fun.constant(rng),
      rtl: Optional.none
    };
  },
  relative: (startSitu, finishSitu) => {
    return {
      ltr: Thunk.cached(() => NativeRange.relativeToNative(win, startSitu, finishSitu)),
      rtl: Thunk.cached(() => Optional.some(NativeRange.relativeToNative(win, finishSitu, startSitu)))
    };
  },
  exact: (start: SugarElement<Node>, soffset: number, finish: SugarElement<Node>, foffset: number) => {
    return {
      ltr: Thunk.cached(() => NativeRange.exactToNative(win, start, soffset, finish, foffset)),
      rtl: Thunk.cached(() => Optional.some(NativeRange.exactToNative(win, finish, foffset, start, soffset)))
    };
  }
});

const doDiagnose = (win: Window, ranges: LtrRtlRanges): SelectionDirection => {
  // If we cannot create a ranged selection from start > finish, it could be RTL
  const rng = ranges.ltr();
  if (rng.collapsed) {
    // Let's check if it's RTL ... if it is, then reversing the direction will not be collapsed
    const reversed = ranges.rtl().filter((rev) => rev.collapsed === false);

    return reversed.map((rev) =>
      // We need to use "reversed" here, because the original only has one point (collapsed)
      adt.rtl(
        SugarElement.fromDom(rev.endContainer), rev.endOffset,
        SugarElement.fromDom(rev.startContainer), rev.startOffset
      )
    ).getOrThunk(() => fromRange(win, adt.ltr, rng));
  } else {
    return fromRange(win, adt.ltr, rng);
  }
};

const diagnose = (win: Window, selection: SimSelection): SelectionDirection => {
  const ranges = getRanges(win, selection);
  return doDiagnose(win, ranges);
};

const asLtrRange = (win: Window, selection: SimSelection): Range => {
  const diagnosis = diagnose(win, selection);
  return diagnosis.match({
    ltr: (start, soffset, finish, foffset): Range => {
      const rng = win.document.createRange();
      rng.setStart(start.dom, soffset);
      rng.setEnd(finish.dom, foffset);
      return rng;
    },
    rtl: (start, soffset, finish, foffset) => {
      // NOTE: Reversing start and finish
      const rng = win.document.createRange();
      rng.setStart(finish.dom, foffset);
      rng.setEnd(start.dom, soffset);
      return rng;
    }
  });
};

const ltr = adt.ltr;
const rtl = adt.rtl;

export { ltr, rtl, diagnose, asLtrRange };
