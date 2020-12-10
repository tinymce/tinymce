import { SugarElement } from '@ephox/sugar';
import * as Sizes from '../resize/Sizes';

const halve = (main: SugarElement, other: SugarElement): void => {
  const width = Sizes.getGenericWidth(main);
  width.each((w) => {
    const newWidth = w.value / 2;
    Sizes.setGenericWidth(main, newWidth, w.unit);
    Sizes.setGenericWidth(other, newWidth, w.unit);
  });
};

export {
  halve
};
