import { SugarElement } from '@ephox/sugar';

export type RowElement = HTMLTableRowElement | HTMLTableColElement;
export type CellElement = HTMLTableCellElement | HTMLTableColElement;
export type RowCell<R extends RowElement> = R extends HTMLTableRowElement ? HTMLTableCellElement : HTMLTableColElement;

export type CompElm = (a: SugarElement<HTMLElement>, b: SugarElement<HTMLElement>) => boolean;
export type Subst = <T extends RowElement | CellElement>(element: SugarElement<T>, comparator: CompElm) => SugarElement<T>;

