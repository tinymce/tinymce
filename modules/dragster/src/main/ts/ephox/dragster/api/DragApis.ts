import { Contracts, Optional } from '@ephox/katamari';
import { EventArgs, SugarElement, SugarPosition } from '@ephox/sugar';
import { BlockerOptions } from '../detect/Blocker';

export interface DragMutation {
  mutate: (x: number, y: number) => void;
}

export interface DragMode {
  compare: (old: SugarPosition, nu: SugarPosition) => SugarPosition;
  extract: (event: EventArgs) => Optional<SugarPosition>;
  mutate: (mutation: DragMutation, info: SugarPosition) => void;
  sink: (dragApi: DragApi, settings: Partial<BlockerOptions>) => DragSink;
}

export interface DragSink {
  element: () => SugarElement;
  start: (parent: SugarElement) => void;
  stop: () => void;
  destroy: () => void;
}

export interface DragApi {
  forceDrop: (evt?: EventArgs) => void;
  drop: (evt?: EventArgs) => void;
  move: (evt: EventArgs) => void;
  delayDrop: (evt?: EventArgs) => void;
}

export const DragMode: (value: DragMode) => DragMode = Contracts.exactly([
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

export const DragApi: (value: DragApi) => DragApi = Contracts.exactly([
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
