import { Adt, Optional } from '@ephox/katamari';
import { DomParent } from '@ephox/robin';
import { Awareness, Compare, SelectorFind, SugarElement } from '@ephox/sugar';

import { WindowBridge } from '../api/WindowBridge';

type NoneHandler<T> = (message: string) => T;
type SuccessHandler<T> = () => T;
type FailedUpHandler<T> = (cell: SugarElement<HTMLTableCellElement>) => T;
type FailedDownHandler<T> = (cell: SugarElement<HTMLTableCellElement>) => T;

export interface BeforeAfter {
  fold: <T> (
    none: NoneHandler<T>,
    success: SuccessHandler<T>,
    failedUp: FailedUpHandler<T>,
    failedDown: FailedDownHandler<T>,
  ) => T;
  match: <T>(branches: {
    none: NoneHandler<T>;
    success: SuccessHandler<T>;
    failedUp: FailedUpHandler<T>;
    failedDown: FailedDownHandler<T>;
  }) => T;
  log: (label: string) => void;
}

export type BeforeAfterFailureConstructor = (cell: SugarElement<HTMLTableCellElement>) => BeforeAfter;

const adt: {
  none: (message: string) => BeforeAfter;
  success: () => BeforeAfter;
  failedUp: BeforeAfterFailureConstructor;
  failedDown: BeforeAfterFailureConstructor;
} = Adt.generate([
  { none: [ 'message' ] },
  { success: [] },
  { failedUp: [ 'cell' ] },
  { failedDown: [ 'cell' ] }
]);

// Let's get some bounding rects, and see if they overlap (x-wise)
const isOverlapping = (bridge: WindowBridge, before: SugarElement<Element>, after: SugarElement<Element>): boolean => {
  const beforeBounds = bridge.getRect(before);
  const afterBounds = bridge.getRect(after);
  return afterBounds.right > beforeBounds.left && afterBounds.left < beforeBounds.right;
};

const isRow = (elem: SugarElement<Node>): Optional<SugarElement<HTMLTableRowElement>> => {
  return SelectorFind.closest(elem, 'tr');
};

const verify = (
  bridge: WindowBridge,
  before: SugarElement<Node>,
  beforeOffset: number,
  after: SugarElement<Node>,
  afterOffset: number,
  failure: BeforeAfterFailureConstructor,
  isRoot: (e: SugarElement<Node>) => boolean
): BeforeAfter => {
  // Identify the cells that the before and after are in.
  return SelectorFind.closest<HTMLTableCellElement>(after, 'td,th', isRoot).bind((afterCell) => {
    return SelectorFind.closest<HTMLTableCellElement>(before, 'td,th', isRoot).map((beforeCell) => {
      // If they are not in the same cell
      if (!Compare.eq(afterCell, beforeCell)) {
        return DomParent.sharedOne(isRow, [ afterCell, beforeCell ]).fold(() => {
          // No shared row, and they overlap x-wise -> success, otherwise: failed
          return isOverlapping(bridge, beforeCell, afterCell) ? adt.success() : failure(beforeCell);
        }, (_sharedRow) => {
          // In the same row, so it failed.
          return failure(beforeCell);
        });
      } else {
        return Compare.eq(after, afterCell) && Awareness.getEnd(afterCell) === afterOffset ? failure(beforeCell) : adt.none('in same cell');
      }
    });
  }).getOr(adt.none('default'));
};

const cata = <T>(subject: BeforeAfter, onNone: NoneHandler<T>, onSuccess: SuccessHandler<T>, onFailedUp: FailedUpHandler<T>, onFailedDown: FailedDownHandler<T>): T => {
  return subject.fold(onNone, onSuccess, onFailedUp, onFailedDown);
};

export const BeforeAfter = {
  ...adt,
  verify,
  cata
};
