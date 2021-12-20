import { Adt } from '@ephox/katamari';
import { SugarElement } from '@ephox/sugar';

/*
 * The CellLocation ADT is used to represent a cell when navigating. The
 * last type constructor is used because special behaviour may be required
 * when navigating past the last cell (e.g. create a new row).
 */

type NoneHandler<T> = (current: SugarElement<HTMLTableCellElement> | undefined) => T;
type FirstHandler<T> = (current: SugarElement<HTMLTableCellElement>) => T;
type MiddleHandler<T> = (current: SugarElement<HTMLTableCellElement>, target: SugarElement<HTMLTableCellElement>) => T;
type LastHandler<T> = (current: SugarElement<HTMLTableCellElement>) => T;

export interface CellLocation {
  fold: <T> (
    none: NoneHandler<T>,
    first: FirstHandler<T>,
    middle: MiddleHandler<T>,
    last: LastHandler<T>
  ) => T;
  match: <T> (branches: {
    none: NoneHandler<T>;
    first: FirstHandler<T>;
    middle: MiddleHandler<T>;
    last: LastHandler<T>;
  }) => T;
  log: (label: string) => void;
}

const adt: {
  none: (current: SugarElement<HTMLTableCellElement> | undefined) => CellLocation;
  first: (current: SugarElement<HTMLTableCellElement>) => CellLocation;
  middle: (current: SugarElement<HTMLTableCellElement>, target: SugarElement<HTMLTableCellElement>) => CellLocation;
  last: (current: SugarElement<HTMLTableCellElement>) => CellLocation;
} = Adt.generate([
  { none: [ 'current' ] },
  { first: [ 'current' ] },
  { middle: [ 'current', 'target' ] },
  { last: [ 'current' ] }
]);

const none = (current?: SugarElement<HTMLTableCellElement>): CellLocation => adt.none(current);

export const CellLocation = {
  ...adt,
  none
};
