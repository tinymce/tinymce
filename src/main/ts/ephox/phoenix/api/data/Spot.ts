import { Struct } from '@ephox/katamari';
import { SpotDelta, SpotPoint, SpotPoints, SpotRange, SpotText } from './Types';

type PointConstructor = <E> (element: E, offset: number) => SpotPoint<E>;
const point: PointConstructor = Struct.immutable('element', 'offset');

type DeltaConstructor = <E> (element: E, deltaOffset: number) => SpotDelta<E>;
const delta: DeltaConstructor = Struct.immutable('element', 'deltaOffset');

type RangeConstructor = <E> (element: E, start: number, finish: number) => SpotRange<E>;
const range: RangeConstructor = Struct.immutable('element', 'start', 'finish');

type PointsConstructor = <E> (begin: SpotPoint<E>, end: SpotPoint<E>) => SpotPoints<E>;
const points: PointsConstructor = Struct.immutable('begin', 'end');

type TextConstructor = <E> (element: E, text: any) => SpotText<E>;
const text: TextConstructor = Struct.immutable('element', 'text');

export {
  point,
  delta,
  range,
  points,
  text,
};