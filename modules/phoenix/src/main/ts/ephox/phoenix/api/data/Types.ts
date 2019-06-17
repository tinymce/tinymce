import { Universe } from '@ephox/boss';
import { Option } from '@ephox/katamari';

export interface SpotPoint<E> {
  element(): E;
  offset(): number;
}

export interface SpotDelta<E> {
  element(): E;
  deltaOffset(): number;
}

export interface SpotRange<E> {
  element(): E;
  start(): number;
  finish(): number;
}

export interface SpotPoints<E> {
  begin(): SpotPoint<E>;
  end(): SpotPoint<E>;
}

export interface SpotText<E> {
  element(): E;
  text(): any; // TODO narrow type
}

export interface SearchResult<E> {
  elements: () => E[];
  word: () => string;
  exact: () => string;
}

export interface Direction {
  sibling: <E, D>(universe: Universe<E, D>, item: E) => Option<E>;
  first: <E>(children: E[]) => Option<E>;
}

export type Transition = <E, D> (universe: Universe<E, D>, item: E, direction: Direction, _transition?: Transition) => Option<Traverse<E>>;

export interface Traverse<E> {
  item(): E;
  mode(): Transition;
}

export type Successor = {
  current: Transition,
  next: Transition,
  fallback: Option<Transition>
};

export interface Wrapter<E> {
  element: () => E;
  wrap: (contents: E) => void;
}

export interface SpanWrapRange<E> {
  range(): SpotPoints<E>;
  temporary(): boolean;
  wrappers(): E[];
}