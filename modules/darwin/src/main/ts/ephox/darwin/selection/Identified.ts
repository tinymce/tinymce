import { Option, Struct } from '@ephox/katamari';
import { Element } from '@ephox/sugar';

interface IdentifiedInput {
  boxes: Option<Element[]>;
  start: Element;
  finish: Element;
}

export interface Identified {
  boxes: () => Option<Element[]>;
  start: () => Element;
  finish: () => Element;
}

export interface IdentifiedExt {
  boxes: () => Element[];
  start: () => Element;
  finish: () => Element;
}

const create: (obj: IdentifiedInput) => Identified = Struct.immutableBag(['boxes', 'start', 'finish'], []);

export const Identified = {
  create
};