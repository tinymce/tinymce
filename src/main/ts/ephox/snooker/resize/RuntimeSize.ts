import { PlatformDetection } from '@ephox/sand';
import { Css } from '@ephox/sugar';
import { Height } from '@ephox/sugar';
import { Width } from '@ephox/sugar';

var platform = PlatformDetection.detect();

var needManualCalc = function () {
  return platform.browser.isIE() || platform.browser.isEdge();
};

var toNumber = function (px, fallback) {
  var num = parseFloat(px); // parseFloat removes suffixes like px
  return isNaN(num) ? fallback : num;
};

var getProp = function (elm, name, fallback) {
  return toNumber(Css.get(elm, name), fallback);
};

var getCalculatedHeight = function (cell) {
  var paddingTop = getProp(cell, 'padding-top', 0);
  var paddingBottom = getProp(cell, 'padding-bottom', 0);
  var borderTop = getProp(cell, 'border-top-width', 0);
  var borderBottom = getProp(cell, 'border-bottom-width', 0);
  var height = cell.dom().getBoundingClientRect().height;
  var boxSizing = Css.get(cell, 'box-sizing');
  var borders = borderTop + borderBottom;

  return boxSizing === 'border-box' ? height : height - paddingTop - paddingBottom - borders;
};

var getWidth = function (cell) {
  return getProp(cell, 'width', Width.get(cell));
};

var getHeight = function (cell) {
  return needManualCalc() ? getCalculatedHeight(cell) : getProp(cell, 'height', Height.get(cell));
};

export default {
  getWidth: getWidth,
  getHeight: getHeight
};