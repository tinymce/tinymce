import { HTMLElement } from '@ephox/dom-globals';
import { PlatformDetection } from '@ephox/sand';
import { Css, Element, Height, Width } from '@ephox/sugar';

const needManualCalc = () => {
  const browser = PlatformDetection.detect().browser;
  return browser.isIE() || browser.isEdge();
};

const toNumber = (px: string, fallback: number) => {
  const num = parseFloat(px); // parseFloat removes suffixes like px
  return isNaN(num) ? fallback : num;
};

const getProp = (elm: Element, name: string, fallback: number) => toNumber(Css.get(elm, name), fallback);

const getCalculatedHeight = (cell: Element<HTMLElement>) => {
  const height = cell.dom().getBoundingClientRect().height;
  const boxSizing = Css.get(cell, 'box-sizing');
  if (boxSizing === 'border-box') {
    return height;
  } else {
    const paddingTop = getProp(cell, 'padding-top', 0);
    const paddingBottom = getProp(cell, 'padding-bottom', 0);
    const borderTop = getProp(cell, 'border-top-width', 0);
    const borderBottom = getProp(cell, 'border-bottom-width', 0);
    const borders = borderTop + borderBottom;

    return height - paddingTop - paddingBottom - borders;
  }
};

const getCalculatedWidth = (cell: Element<HTMLElement>) => {
  const width = cell.dom().getBoundingClientRect().width;
  const boxSizing = Css.get(cell, 'box-sizing');
  if (boxSizing === 'border-box') {
    return width;
  } else {
    const paddingLeft = getProp(cell, 'padding-left', 0);
    const paddingRight = getProp(cell, 'padding-right', 0);
    const borderLeft = getProp(cell, 'border-left-width', 0);
    const borderRight = getProp(cell, 'border-right-width', 0);
    const borders = borderLeft + borderRight;

    return width - paddingLeft - paddingRight - borders;
  }
};

const getHeight = (cell: Element<HTMLElement>) => needManualCalc() ? getCalculatedHeight(cell) : getProp(cell, 'height', Height.get(cell));

const getWidth = (cell: Element<HTMLElement>) => needManualCalc() ? getCalculatedWidth(cell) : getProp(cell, 'width', Width.get(cell));

export {
  getHeight,
  getWidth
};
