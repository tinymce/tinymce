import { Fun } from '@ephox/katamari';
import { SpotDelta, SpotPoint, SpotPoints, SpotRange, SpotText } from './Types';

const point = <E> (element: E, offset: number): SpotPoint<E> => ({
  element: Fun.constant(element),
  offset: Fun.constant(offset)
});

const delta = <E> (element: E, deltaOffset: number): SpotDelta<E> => ({
  element: Fun.constant(element),
  deltaOffset: Fun.constant(deltaOffset)
});

const range = <E> (element: E, start: number, finish: number): SpotRange<E> => ({
  element: Fun.constant(element),
  start: Fun.constant(start),
  finish: Fun.constant(finish)
});

const points = <E> (begin: SpotPoint<E>, end: SpotPoint<E>): SpotPoints<E> => ({
  begin: Fun.constant(begin),
  end: Fun.constant(end)
});

const text = <E> (element: E, text: any): SpotText<E> => ({
  element: Fun.constant(element),
  text: Fun.constant(text)
});

export {
  point,
  delta,
  range,
  points,
  text
};
