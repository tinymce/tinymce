import { HTMLDocument } from '@ephox/dom-globals';
import { EventArgs, EventUnbinder, Position, SimRange } from '@ephox/sugar';

// TODO move these to the correct village

// Sugar Dom

export interface SugarDocument {
  dom: () => HTMLDocument;
}

export type SugarEvent = EventArgs;
export type SugarListener = EventUnbinder;
export type SugarPosition = Position;
export type SugarRange = SimRange;

export type GeneralStruct = () => { [ key: string ]: () => any };
