import { Adt } from '@ephox/katamari';

type NoneHandler<T> = () => T;
type OnlyHandler<T> = (index: number) => T;
type LeftHandler<T> = (index: number, next: number) => T;
type MiddleHandler<T> = (prev: number, index: number, next: number) => T;
type RightHandler<T> = (prev: number, index: number) => T;

export interface ColumnContext {
  fold: <T> (
    none: NoneHandler<T>,
    only: OnlyHandler<T>,
    left: LeftHandler<T>,
    middle: MiddleHandler<T>,
    right: RightHandler<T>,
  ) => T;
  match: <T> (branches: {
    none: NoneHandler<T>,
    only: OnlyHandler<T>,
    left: LeftHandler<T>,
    middle: MiddleHandler<T>,
    right: RightHandler<T>,
  }) => T;
  log: (label: string) => void;
}

const adt: {
  none: NoneHandler<ColumnContext>;
  only: OnlyHandler<ColumnContext>;
  left: LeftHandler<ColumnContext>;
  middle: MiddleHandler<ColumnContext>;
  right: RightHandler<ColumnContext>;
} = Adt.generate([
  { none: [] },
  { only: [ 'index' ] },
  { left: [ 'index', 'next' ] },
  { middle: [ 'prev', 'index', 'next' ] },
  { right: [ 'prev', 'index' ] },
]);

export const ColumnContext = {
  ...adt
};