import { SugarElement } from '../node/SugarElement';

export interface EventArgs<T = Event> {
  readonly target: SugarElement;
  readonly x: number;
  readonly y: number;
  readonly stop: () => void;
  readonly prevent: () => void;
  readonly kill: () => void;
  readonly raw: T;
}

export interface EventUnbinder {
  unbind: () => void;
}

export type EventHandler<T = Event> = (evt: EventArgs<T>) => void;
export type EventFilter<T = Event> = (evt: T) => boolean;
