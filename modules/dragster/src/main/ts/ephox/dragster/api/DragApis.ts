import { Contracts, Option } from '@ephox/katamari';
import { EventArgs, Element, Position } from '@ephox/sugar';
import { BlockerOptions } from '../detect/Blocker';

export interface DragMutation {
  mutate: (x: number, y: number) => void;
}

export interface DragMode {
  compare: (old: Position, nu: Position) => Position;
  extract: (event: EventArgs) => Option<Position>;
  mutate: (mutation: DragMutation, info: Position) => void;
  sink: (dragApi: DragApi, settings: Partial<BlockerOptions>) => DragSink;
}

export interface DragSink {
  element: () => Element;
  start: (parent: Element) => void;
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