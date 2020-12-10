import { SpotDelta, SpotPoint, SpotPoints, SpotRange, SpotText } from './Types';

const point = <E>(element: E, offset: number): SpotPoint<E> => ({
  element,
  offset
});

const delta = <E>(element: E, deltaOffset: number): SpotDelta<E> => ({
  element,
  deltaOffset
});

const range = <E>(element: E, start: number, finish: number): SpotRange<E> => ({
  element,
  start,
  finish
});

const points = <E>(begin: SpotPoint<E>, end: SpotPoint<E>): SpotPoints<E> => ({
  begin,
  end
});

const text = <E>(element: E, text: string): SpotText<E> => ({
  element,
  text
});

export {
  point,
  delta,
  range,
  points,
  text
};
