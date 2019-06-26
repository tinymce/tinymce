import { Arr } from '@ephox/katamari';
import { Css, Element, SelectorFilter, Traverse } from '@ephox/sugar';
import { getPixelWidth } from '../alien/Util';

const calculatePercentageWidth = (element: Element, parent: Element): string => {
  return getPixelWidth(element.dom()) / getPixelWidth(parent.dom()) * 100 + '%';
};

const enforcePercentage = (table: Element) => {
  Traverse.parent(table).map((parent) => calculatePercentageWidth(table, parent)).each((tablePercentage) => {
    Css.set(table, 'width', tablePercentage);

    Arr.each(SelectorFilter.descendants(table, 'tr'), (tr) => {
      Arr.each(Traverse.children(tr), (td) => {
        Css.set(td, 'width', calculatePercentageWidth(td, tr));
      });
    });
  });
};

const enforcePixels = (table: Element) => {
  Css.set(table, 'width', getPixelWidth(table.dom()).toString() + 'px');
};

const enforceUnits = (table: Element, pixelsForced: boolean) => {
  if (pixelsForced) {
    enforcePixels(table);
  } else {
    enforcePercentage(table);
  }
};

export { enforceUnits };
