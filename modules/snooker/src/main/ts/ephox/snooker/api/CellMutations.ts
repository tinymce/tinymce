import { SugarElement } from '@ephox/sugar';

import * as Sizes from '../resize/Sizes';
import * as CellUtils from '../util/CellUtils';

const halve = (main: SugarElement, other: SugarElement): void => {
  const colspan = CellUtils.getSpan(main, 'colspan');
  // Only set width on the new cell if we have a colspan of 1 (or no colspan) as we can only safely do that for cells
  // that are a single column, since we don't know the individual column widths for a cell with a colspan.
  // Instead, we'll rely on the adjustments/postAction logic to set the widths based on other cells in the column
  if (colspan === 1) {
    const width = Sizes.getGenericWidth(main);
    width.each((w) => {
      const newWidth = w.value / 2;
      Sizes.setGenericWidth(main, newWidth, w.unit);
      Sizes.setGenericWidth(other, newWidth, w.unit);
    });
  }
};

export {
  halve
};
