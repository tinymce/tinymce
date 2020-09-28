import { SugarElement } from '@ephox/sugar';
import * as Sizes from '../resize/Sizes';

const halve = function (main: SugarElement, other: SugarElement) {
  const width = Sizes.getGenericWidth(main);
  width.each(function (w) {
    const newWidth = w.value / 2;
    Sizes.setGenericWidth(main, newWidth, w.unit);
    Sizes.setGenericWidth(other, newWidth, w.unit);
  });
};

export {
  halve
};
