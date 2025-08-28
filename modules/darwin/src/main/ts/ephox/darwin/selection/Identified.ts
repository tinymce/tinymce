import { Optional } from '@ephox/katamari';
import { SugarElement } from '@ephox/sugar';

export interface Identified {
  readonly boxes: Optional<SugarElement<HTMLTableCellElement>[]>;
  readonly start: SugarElement<HTMLTableCellElement>;
  readonly finish: SugarElement<HTMLTableCellElement>;
}

export interface IdentifiedExt {
  readonly boxes: SugarElement<HTMLTableCellElement>[];
  readonly start: SugarElement<HTMLTableCellElement>;
  readonly finish: SugarElement<HTMLTableCellElement>;
}
