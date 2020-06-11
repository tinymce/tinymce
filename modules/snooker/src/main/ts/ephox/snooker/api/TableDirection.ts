import { ResizeDirection } from './ResizeDirection';
import { Option } from '@ephox/katamari';
import { Element } from '@ephox/sugar';
import { BarPositions, ColInfo } from '../resize/BarPositions';

export type TableDirection = BarPositions<ColInfo>;

export const TableDirection = (directionAt: (e: Element) => { isRtl: () => boolean }): TableDirection => {
  const auto = (table: Element) => directionAt(table).isRtl() ? ResizeDirection.rtl : ResizeDirection.ltr;

  const delta = (amount: number, table: Element) => auto(table).delta(amount, table);

  const positions = (cols: Option<Element>[], table: Element) => auto(table).positions(cols, table);

  const edge = (cell: Element) => auto(cell).edge(cell);

  return {
    delta,
    edge,
    positions
  };
};
