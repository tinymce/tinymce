import { Adt } from '@ephox/katamari';

export interface ZonePosition<E> {
  fold: <T> (
    aboveView: (item: E) => T,
    inView: (item: E) => T,
    belowView: (item: E) => T
  ) => T;
  match: <T> (branches: {
    aboveView: (item: E) => T;
    inView: (item: E) => T;
    belowView: (item: E) => T;
  }) => T;
  log: (label: string) => void;
}

const adt: {
  aboveView: <E>(item: E) => ZonePosition<E>;
  inView: <E>(item: E) => ZonePosition<E>;
  belowView: <E>(item: E) => ZonePosition<E>;
} = Adt.generate([
  { aboveView: [ 'item' ] },
  { inView: [ 'item' ] },
  { belowView: [ 'item' ] }
]);

const cata = <E, T>(subject: ZonePosition<E>, onAbove: (item: E) => T, onIn: (item: E) => T, onBelow: (item: E) => T): T => {
  return subject.fold(onAbove, onIn, onBelow);
};

export const ZonePosition = {
  ...adt,
  cata
};
