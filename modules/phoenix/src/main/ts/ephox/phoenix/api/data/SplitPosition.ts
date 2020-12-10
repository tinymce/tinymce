import { Adt } from '@ephox/katamari';

type NoneHandler<U> = () => U;
type StartHandler<E, U> = (element: E) => U;
type MiddleHandler<E, U> = (before: E, after: E) => U;
type EndHandler<E, U> = (element: E) => U;

export interface SplitPosition<E> {
  fold: <U> (
    onNone: NoneHandler<U>,
    onStart: StartHandler<E, U>,
    onMiddle: MiddleHandler<E, U>,
    onEnd: EndHandler<E, U>
  ) => U;
  match: <U> (branches: {
    none: NoneHandler<U>;
    start: StartHandler<E, U>;
    middle: MiddleHandler<E, U>;
    end: EndHandler<E, U>;
  }) => U;
  log: (label: string) => void;
}

const adt: {
  none: <E>() => SplitPosition<E>;
  start: <E>(element: E) => SplitPosition<E>;
  middle: <E>(before: E, after: E) => SplitPosition<E>;
  end: <E>(element: E) => SplitPosition<E>;
} = Adt.generate([
  { none: [] },
  { start: [ 'element' ] },
  { middle: [ 'before', 'after' ] },
  { end: [ 'element' ] }
]);

export const SplitPosition = {
  none: adt.none,
  start: adt.start,
  middle: adt.middle,
  end: adt.end
};
