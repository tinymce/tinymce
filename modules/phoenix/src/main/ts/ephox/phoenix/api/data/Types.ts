import { Universe } from '@ephox/boss';
import { Optional } from '@ephox/katamari';

export interface SpotPoint<E> {
  readonly element: E;
  readonly offset: number;
}

export interface SpotDelta<E> {
  readonly element: E;
  readonly deltaOffset: number;
}

export interface SpotRange<E> {
  readonly element: E;
  readonly start: number;
  readonly finish: number;
}

export interface SpotPoints<E> {
  readonly begin: SpotPoint<E>;
  readonly end: SpotPoint<E>;
}

export interface SpotText<E> {
  readonly element: E;
  readonly text: string;
}

export interface SearchResult<E> {
  readonly elements: E[];
  readonly word: string;
  readonly exact: string;
}

export interface Direction {
  readonly sibling: <E, D>(universe: Universe<E, D>, item: E) => Optional<E>;
  readonly first: <E>(children: E[]) => Optional<E>;
}

export type Transition = <E, D>(universe: Universe<E, D>, item: E, direction: Direction, _transition?: Transition) => Optional<Traverse<E>>;

export interface Traverse<E> {
  readonly item: E;
  readonly mode: Transition;
}

export interface Successor {
  readonly current: Transition;
  readonly next: Transition;
  readonly fallback: Optional<Transition>;
}

export interface Wrapter<E> {
  readonly element: E;
  readonly wrap: (contents: E) => void;
}

export interface SpanWrapRange<E> {
  readonly range: SpotPoints<E>;
  readonly temporary: boolean;
  readonly wrappers: E[];
}
