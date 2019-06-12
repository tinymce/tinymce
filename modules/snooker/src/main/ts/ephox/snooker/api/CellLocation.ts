import { Adt } from '@ephox/katamari';
import { Element } from '@ephox/sugar';

/*
 * The CellLocation ADT is used to represent a cell when navigating. The
 * last type constructor is used because special behaviour may be required
 * when navigating past the last cell (e.g. create a new row).
 */

type NoneHandler<T> = (current: Element | undefined) => T;
type FirstHandler<T> = (current: Element) => T;
type MiddleHandler<T> = (current: Element, target: any) => T;
type LastHandler<T> = (current: Element) => T;

export interface CellLocation {
  fold: <T> (
    none: NoneHandler<T>,
    first: FirstHandler<T>,
    middle: MiddleHandler<T>,
    last: LastHandler<T>
  ) => T;
  match: <T> (branches: {
    none: NoneHandler<T>,
    first: FirstHandler<T>,
    middle: MiddleHandler<T>,
    last: LastHandler<T>
  }) => T;
  log: (label: string) => void;
}

const adt: {
  none: (current: Element | undefined) => CellLocation;
  first: (current: Element) => CellLocation;
  middle: (current: Element, target: Element) => CellLocation;
  last: (current: Element) => CellLocation;
} = Adt.generate([
  { none: ['current'] },
  { first: ['current'] },
  { middle: ['current', 'target'] },
  { last: ['current'] }
]);

const none = (current: Element | undefined = undefined) => adt.none(current);

export const CellLocation = {
  ...adt,
  none,
};