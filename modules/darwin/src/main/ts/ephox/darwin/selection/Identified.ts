import { Option } from '@ephox/katamari';
import { SugarElement } from '@ephox/sugar';

export interface Identified {
  boxes: Option<SugarElement[]>;
  start: SugarElement;
  finish: SugarElement;
}

export interface IdentifiedExt {
  boxes: SugarElement[];
  start: SugarElement;
  finish: SugarElement;
}
