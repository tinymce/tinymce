import { PlatformDetection } from '@ephox/sand';
import { Css, Height, SugarElement, Width } from '@ephox/sugar';

const needManualCalc = (): boolean => {
  const browser = PlatformDetection.detect().browser;
  return browser.isIE() || browser.isEdge();
};

const toNumber = (px: string, fallback: number): number => {
  const num = parseFloat(px); // parseFloat removes suffixes like px
  return isNaN(num) ? fallback : num;
};

const getProp = (element: SugarElement<HTMLElement>, name: string, fallback: number): number =>
  toNumber(Css.get(element, name), fallback);

const getBoxSizing = (element: SugarElement<HTMLElement>): string =>
  Css.get(element, 'box-sizing');

const calcContentBoxSize = (element: SugarElement<HTMLElement>, size: number, upper: 'top' | 'left', lower: 'bottom' | 'right') => {
  const paddingUpper = getProp(element, `padding-${upper}`, 0);
  const paddingLower = getProp(element, `padding-${lower}`, 0);
  const borderUpper = getProp(element, `border-${upper}-width`, 0);
  const borderLower = getProp(element, `border-${lower}-width`, 0);

  return size - paddingUpper - paddingLower - borderUpper - borderLower;
};

const getCalculatedHeight = (element: SugarElement<HTMLElement>, boxSizing: string): number => {
  const height = element.dom.getBoundingClientRect().height;
  return boxSizing === 'border-box' ? height : calcContentBoxSize(element, height, 'top', 'bottom');
};

const getCalculatedWidth = (element: SugarElement<HTMLElement>, boxSizing: string): number => {
  const width = element.dom.getBoundingClientRect().width;
  return boxSizing === 'border-box' ? width : calcContentBoxSize(element, width, 'left', 'right');
};

const getHeight = (element: SugarElement<HTMLElement>): number =>
  needManualCalc() ? getCalculatedHeight(element, getBoxSizing(element)) : getProp(element, 'height', Height.get(element));

const getWidth = (element: SugarElement<HTMLElement>): number =>
  needManualCalc() ? getCalculatedWidth(element, getBoxSizing(element)) : getProp(element, 'width', Width.get(element));

const getInnerHeight = (element: SugarElement<HTMLElement>): number =>
  getCalculatedHeight(element, 'content-box');

const getInnerWidth = (element: SugarElement<HTMLElement>): number =>
  getCalculatedWidth(element, 'content-box');

export {
  getInnerHeight,
  getInnerWidth,
  getHeight,
  getWidth
};
