import * as BarPositions from '../resize/BarPositions';

type ColInfo = BarPositions.ColInfo;
type BarPositions<A> = BarPositions.BarPositions<A>;

export type ResizeDirection = BarPositions<ColInfo>;

export const ResizeDirection = {
  ltr: BarPositions.ltr,
  rtl: BarPositions.rtl
};
