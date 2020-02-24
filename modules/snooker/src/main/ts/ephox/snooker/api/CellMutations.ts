import * as Sizes from '../resize/Sizes';
import { Element } from '@ephox/sugar';

const halve = function (main: Element, other: Element) {
  const width = Sizes.getGenericWidth(main);
  width.each(function (w) {
    const newWidth = w.width() / 2;
    Sizes.setGenericWidth(main, newWidth, w.unit());
    Sizes.setGenericWidth(other, newWidth, w.unit());
  });
};

export {
  halve
};
