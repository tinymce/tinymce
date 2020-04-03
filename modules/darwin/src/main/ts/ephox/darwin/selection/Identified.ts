import { Option } from '@ephox/katamari';
import { Element } from '@ephox/sugar';

export interface Identified {
  boxes: Option<Element[]>;
  start: Element;
  finish: Element;
}

export interface IdentifiedExt {
  boxes: Element[];
  start: Element;
  finish: Element;
}
