import { Optional } from '@ephox/katamari';
import { SugarElement } from '@ephox/sugar';

export interface Identified {
  readonly boxes: Optional<SugarElement[]>;
  readonly start: SugarElement;
  readonly finish: SugarElement;
}

export interface IdentifiedExt {
  readonly boxes: SugarElement[];
  readonly start: SugarElement;
  readonly finish: SugarElement;
}
