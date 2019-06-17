import { EventFormat } from '../events/SimulatedEvent';
import { HTMLElement, HTMLDocument, Event, TouchEvent, TransitionEvent, KeyboardEvent, MouseEvent } from '@ephox/dom-globals';
import { Element } from '@ephox/sugar';

// TODO move these to the correct village

// Sugar Dom

export interface SugarListener {
  unbind: () => void;
}

export interface SugarDocument {
  dom: () => HTMLDocument;
}

// Sugar Event
export interface SugarEvent extends EventFormat {
  kill: () => void;
  prevent: () => void;
  raw: () => Event | TouchEvent | TransitionEvent | MouseEvent | KeyboardEvent;
  stop: () => void;
  target: () => Element;
  x: () => number;
  y: () => number;
}

// Sugar Position
export interface SugarPosition {
  left: () => number;
  top: () => number;
  translate: (x: number, y: number) => SugarPosition;
}

export interface SugarRange {
  start: () => Element;
  soffset: () => number;
  finish: () => Element;
  foffset: () => number;
}

export type GeneralStruct = () => { [ key: string ]: () => any };