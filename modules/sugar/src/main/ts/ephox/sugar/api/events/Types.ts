import { SugarElement } from '../node/SugarElement';

export interface EventArgs<E = Event, T extends Node | Window = Node> {
  readonly target: SugarElement<T>;
  readonly x: E extends { clientX: number } ? number : undefined;
  readonly y: E extends { clientY: number } ? number : undefined;
  readonly stop: () => void;
  readonly prevent: () => void;
  readonly kill: () => void;
  readonly raw: E;
}

export interface EventUnbinder {
  unbind: () => void;
}

export type EventHandler<E = Event, T extends Node | Window = Node> = (evt: EventArgs<E, T>) => void;
export type EventFilter<E = Event> = (evt: E) => boolean;
