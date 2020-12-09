import { PlatformDetection } from 'ephox/sand/core/PlatformDetection';

const isEdge = function (platform: PlatformDetection): boolean {
  return platform.browser.isEdge();
};

const isChrome = function (platform: PlatformDetection): boolean {
  return platform.browser.isChrome();
};

const isFirefox = function (platform: PlatformDetection): boolean {
  return platform.browser.isFirefox();
};

const isIE11 = function (platform: PlatformDetection): boolean {
  return isIE(platform) && platform.browser.version.major === 11;
};

const isIE = function (platform: PlatformDetection): boolean {
  return platform.browser.isIE();
};

const isSafari = function (platform: PlatformDetection): boolean {
  return platform.browser.isSafari();
};

const isOpera = function (platform: PlatformDetection): boolean {
  return platform.browser.isOpera();
};

export {
  isEdge,
  isChrome,
  isFirefox,
  isOpera,
  isIE11,
  isIE,
  isSafari
};
