import { Adt } from '@ephox/katamari';

type SplittingHandler<T, U> = (item: T) => U;

export interface Splitting<T> {
  fold: <U> (
    onInclude: SplittingHandler<T, U>,
    onExcludeWith: SplittingHandler<T, U>,
    onExcludeWithout: SplittingHandler<T, U>
  ) => U;
  match: <U> (branches: {
    include: SplittingHandler<T, U>;
    excludeWith: SplittingHandler<T, U>;
    excludeWithout: SplittingHandler<T, U>;
  }) => U;
  log: (label: string) => void;
}

const adt: {
  include: <T> (item: T) => Splitting<T>;
  excludeWith: <T> (item: T) => Splitting<T>;
  excludeWithout: <T> (item: T) => Splitting<T>;
} = Adt.generate([
  { include: [ 'item' ] },
  { excludeWith: [ 'item' ] },
  { excludeWithout: [ 'item' ] }
]);

const cata = <T, U>(
  subject: Splitting<T>,
  onInclude: SplittingHandler<T, U>,
  onExcludeWith: SplittingHandler<T, U>,
  onExcludeWithout: SplittingHandler<T, U>
): U => {
  return subject.fold(onInclude, onExcludeWith, onExcludeWithout);
};

export const Splitting = {
  include: adt.include,
  excludeWith: adt.excludeWith,
  excludeWithout: adt.excludeWithout,
  cata
};
