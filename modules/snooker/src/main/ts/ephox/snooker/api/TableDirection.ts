import { Option } from '@ephox/katamari';
import { SugarElement } from '@ephox/sugar';
import { BarPositions, ColInfo } from '../resize/BarPositions';
import { ResizeDirection } from './ResizeDirection';

export type TableDirection = BarPositions<ColInfo>;

export const TableDirection = (directionAt: (e: SugarElement) => { isRtl: () => boolean }): TableDirection => {
  const auto = (table: SugarElement) => directionAt(table).isRtl() ? ResizeDirection.rtl : ResizeDirection.ltr;

  const delta = (amount: number, table: SugarElement) => auto(table).delta(amount, table);

  const positions = (cols: Option<SugarElement>[], table: SugarElement) => auto(table).positions(cols, table);

  const edge = (cell: SugarElement) => auto(cell).edge(cell);

  return {
    delta,
    edge,
    positions
  };
};
