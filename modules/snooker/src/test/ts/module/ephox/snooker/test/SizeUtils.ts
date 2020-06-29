import { Assert } from '@ephox/bedrock-client';
import { Arr } from '@ephox/katamari';
import { Css, Element, Head, Insert, Remove, SelectorFilter } from '@ephox/sugar';

const addStyles = () => {
  const style = Element.fromHtml('<style>table { border-collapse: collapse; } td { border: 1px solid #333; min-width: 25px; }</style>');
  Insert.append(Head.head(), style);

  return {
    remove: () => Remove.remove(style)
  };
};

const reducePrecision = (value: string, precision: number = 1) => {
  const floatValue = parseFloat(value);
  if (!floatValue) {
    return value;
  } else {
    const match = /^\d+(\.\d+)?(px|%)$/.exec(value);
    const unit = match ? match[2] : '';
    const p = Math.pow(10, precision);
    return (Math.round(floatValue * p ) / p) + unit;
  }
};

const readWidth = (element: Element) => {
  const rows = SelectorFilter.descendants(element, 'tr');
  return Arr.map(rows, (row) => {
    const cells = SelectorFilter.descendants(row, 'td,th');
    return Arr.map(cells, (cell) =>
      Css.getRaw(cell, 'width').map(reducePrecision).getOrNull()
    );
  });
};

const readHeight = (element: Element) => {
  const rows = SelectorFilter.descendants(element, 'tr');
  return Arr.map(rows, (row) => {
    const cells = SelectorFilter.descendants(row, 'td,th');
    return Arr.map(cells, (cell) =>
      Css.getRaw(cell, 'height').map(reducePrecision).getOrNull()
    );
  });
};

const assertApproxCellSizes = (expectedSizes: (string | null)[][], actualSizes: (string | null)[][], diff: number = 2) => {
  Arr.each(expectedSizes, (row, rowIdx) => {
    Arr.each(row, (expectedSize, colIdx) => {
      const actualSize = actualSizes[rowIdx][colIdx];
      const delta = parseFloat(expectedSize || '0') - parseFloat(actualSize || '0');
      Assert.eq(`Assert cell size [${rowIdx}][${colIdx}] should be ${expectedSize}`, true, Math.abs(delta) <= diff);
    });
  });
};

export {
  addStyles,
  assertApproxCellSizes,
  readHeight,
  readWidth
};
