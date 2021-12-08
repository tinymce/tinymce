import { PlatformDetection } from 'ephox/sand/core/PlatformDetection';

const isEdge = (platform: PlatformDetection): boolean => {
  return platform.browser.isEdge();
};

const isChromium = (platform: PlatformDetection): boolean => {
  return platform.browser.isChromium();
};

const isFirefox = (platform: PlatformDetection): boolean => {
  return platform.browser.isFirefox();
};

const isIE11 = (platform: PlatformDetection): boolean => {
  return isIE(platform) && platform.browser.version.major === 11;
};

const isIE = (platform: PlatformDetection): boolean => {
  return platform.browser.isIE();
};

const isSafari = (platform: PlatformDetection): boolean => {
  return platform.browser.isSafari();
};

const isOpera = (platform: PlatformDetection): boolean => {
  return platform.browser.isOpera();
};

export {
  isEdge,
  isChromium,
  isFirefox,
  isOpera,
  isIE11,
  isIE,
  isSafari
};
