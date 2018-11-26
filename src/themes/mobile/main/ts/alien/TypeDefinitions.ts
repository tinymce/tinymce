/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

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

export interface SugarElement {
  dom: () => HTMLElement;
}