import { PlatformDetection } from '@ephox/sand';
import { Css, Height, Width } from '@ephox/sugar';

const platform = PlatformDetection.detect();

const needManualCalc = function () {
  return platform.browser.isIE() || platform.browser.isEdge();
};

const toNumber = function (px, fallback) {
  const num = parseFloat(px); // parseFloat removes suffixes like px
  return isNaN(num) ? fallback : num;
};

const getProp = function (elm, name, fallback) {
  return toNumber(Css.get(elm, name), fallback);
};

const getCalculatedHeight = function (cell) {
  const paddingTop = getProp(cell, 'padding-top', 0);
  const paddingBottom = getProp(cell, 'padding-bottom', 0);
  const borderTop = getProp(cell, 'border-top-width', 0);
  const borderBottom = getProp(cell, 'border-bottom-width', 0);
  const height = cell.dom().getBoundingClientRect().height;
  const boxSizing = Css.get(cell, 'box-sizing');
  const borders = borderTop + borderBottom;

  return boxSizing === 'border-box' ? height : height - paddingTop - paddingBottom - borders;
};

const getWidth = function (cell) {
  return getProp(cell, 'width', Width.get(cell));
};

const getHeight = function (cell) {
  return needManualCalc() ? getCalculatedHeight(cell) : getProp(cell, 'height', Height.get(cell));
};

export default {
  getWidth,
  getHeight
};