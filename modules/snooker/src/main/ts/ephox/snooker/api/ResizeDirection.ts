import { BarPositions, ColInfo } from '../resize/BarPositions';

export type ResizeDirection = BarPositions<ColInfo>;

export const ResizeDirection = {
  ltr: BarPositions.ltr,
  rtl: BarPositions.rtl
};