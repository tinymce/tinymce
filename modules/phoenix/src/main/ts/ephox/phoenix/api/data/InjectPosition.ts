import { Adt } from '@ephox/katamari';

type InjectPositionHandler<E, U> = (item: E) => U;
type InvalidHandler<E, U> = (item: E, offset: number) => U;

export interface InjectPosition<E> {
  fold: <U> (
    onBefore: InjectPositionHandler<E, U>,
    onAfter: InjectPositionHandler<E, U>,
    onRest: InjectPositionHandler<E, U>,
    onLast: InjectPositionHandler<E, U>,
    onInvalid: InvalidHandler<E, U>
  ) => U;
  match: <U> (branches: {
    before: InjectPositionHandler<E, U>,
    after: InjectPositionHandler<E, U>,
    rest: InjectPositionHandler<E, U>,
    last: InjectPositionHandler<E, U>,
    invalid: InvalidHandler<E, U>,
  }) => U;
  log: (label: string) => void;
}

const adt: {
  before: <E> (element: E) => InjectPosition<E>;
  after: <E> (element: E) => InjectPosition<E>;
  rest: <E> (element: E) => InjectPosition<E>;
  last: <E> (element: E) => InjectPosition<E>;
  invalid: <E> (element: E, offset: number) => InjectPosition<E>;
} = Adt.generate([
  { before: ['element'] },
  { after: ['element'] },
  { rest: ['element'] },
  { last: ['element'] },
  { invalid: ['element', 'offset'] }
]);

export const InjectPosition = {
  before: adt.before,
  after: adt.after,
  rest: adt.rest,
  last: adt.last,
  invalid: adt.invalid
};