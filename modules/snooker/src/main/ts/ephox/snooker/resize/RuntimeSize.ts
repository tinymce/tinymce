import { PlatformDetection } from '@ephox/sand';
import { Css, Height, Width, Element } from '@ephox/sugar';
import { HTMLElement } from '@ephox/dom-globals';

const platform = PlatformDetection.detect();

const needManualCalc = function () {
  return platform.browser.isIE() || platform.browser.isEdge();
};

const toNumber = function (px: string, fallback: number) {
  const num = parseFloat(px); // parseFloat removes suffixes like px
  return isNaN(num) ? fallback : num;
};

const getProp = function (elm: Element, name: string, fallback: number) {
  return toNumber(Css.get(elm, name), fallback);
};

const getCalculatedHeight = function (cell: Element) {
  const paddingTop = getProp(cell, 'padding-top', 0);
  const paddingBottom = getProp(cell, 'padding-bottom', 0);
  const borderTop = getProp(cell, 'border-top-width', 0);
  const borderBottom = getProp(cell, 'border-bottom-width', 0);
  const height = (cell.dom() as HTMLElement).getBoundingClientRect().height;
  const boxSizing = Css.get(cell, 'box-sizing');
  const borders = borderTop + borderBottom;

  return boxSizing === 'border-box' ? height : height - paddingTop - paddingBottom - borders;
};

const getWidth = function (cell: Element) {
  return getProp(cell, 'width', Width.get(cell));
};

const getHeight = function (cell: Element) {
  return needManualCalc() ? getCalculatedHeight(cell) : getProp(cell, 'height', Height.get(cell));
};

export default {
  getWidth,
  getHeight
};