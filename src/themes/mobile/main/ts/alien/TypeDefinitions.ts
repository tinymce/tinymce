import { HTMLElement } from '@ephox/dom-globals';

// Localised Type definitions from external Libraries, we can temporarily shoehorn them here, and migrate later

// TODO move these to the correct village

// TODO move this generic into Katamari Adt
export interface AdtInterface {
  fold: <T>(...fn: Array<(...x: any[]) => T>) => T;
  match: <T>(branches: { [k: string]: (...x: any[]) => T }) => T;
  log: (label: string) => string;
}

// Sugar Dom
export interface SugarElement {
  dom: () => HTMLElement;
}

// Sugar Event
export interface SugarEvent {
  kill: () => void;
  prevent: () => void;
  raw: () => any;
  stop: () => void;
  target: () => SugarElement;
  x: () => number;
  y: () => number;
}

// Sugar Position
export interface PositionCoordinates {
  left: () => number;
  top: () => number;
  translate: (x: number, y: number) => PositionCoordinates;
}