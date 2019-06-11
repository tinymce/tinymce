import { ResizeDirection } from './ResizeDirection';
import { Option } from '@ephox/katamari';
import { Element } from '@ephox/sugar';
import { BarPositions, ColInfo } from '../resize/BarPositions';

export default function (directionAt: (e: Element) => { isRtl: () => boolean }): BarPositions<ColInfo> {
  const auto = function (table: Element) {
    return directionAt(table).isRtl() ? ResizeDirection.rtl : ResizeDirection.ltr;
  };

  const delta = function (amount: number, table: Element) {
    return auto(table).delta(amount, table);
  };

  const positions = function (cols: Option<Element>[], table: Element) {
    return auto(table).positions(cols, table);
  };

  const edge = function (cell: Element) {
    return auto(cell).edge(cell);
  };

  return {
    delta,
    edge,
    positions
  };
}