import { Contracts, Optional } from '@ephox/katamari';
import { EventArgs, SugarElement, SugarPosition } from '@ephox/sugar';

import { BlockerOptions } from '../detect/Blocker';

export interface DragMutation {
  mutate: (x: number, y: number) => void;
}

export interface DragMode<T> {
  compare: (old: SugarPosition, nu: SugarPosition) => SugarPosition;
  extract: (event: EventArgs<T>) => Optional<SugarPosition>;
  mutate: (mutation: DragMutation, info: SugarPosition) => void;
  sink: (dragApi: DragApi<T>, settings: Partial<BlockerOptions>) => DragSink;
}

export interface DragSink {
  element: () => SugarElement<HTMLElement>;
  start: (parent: SugarElement<Node>) => void;
  stop: () => void;
  destroy: () => void;
}

export interface DragApi<T> {
  forceDrop: (evt?: EventArgs<T>) => void;
  drop: (evt?: EventArgs<T>) => void;
  move: (evt: EventArgs<T>) => void;
  delayDrop: (evt?: EventArgs<T>) => void;
}

export const DragMode: <T>(value: DragMode<T>) => DragMode<T> = Contracts.exactly([
  'compare',
  'extract',
  'mutate',
  'sink'
]);

export const DragSink: (value: DragSink) => DragSink = Contracts.exactly([
  'element',
  'start',
  'stop',
  'destroy'
]);

export const DragApi: <T>(value: DragApi<T>) => DragApi<T> = Contracts.exactly([
  'forceDrop',
  'drop',
  'move',
  'delayDrop'
]);

// API for backwards compatibility
const mode = DragMode;
const sink = DragSink;
const api = DragApi;

export {
  mode,
  sink,
  api
};
