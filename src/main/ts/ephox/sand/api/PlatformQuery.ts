import { PlatformDetection } from "../core/PlatformDetection";

const isEdge = function (platform: PlatformDetection) {
  return platform.browser.isEdge();
};

const isChrome = function (platform: PlatformDetection) {
  return platform.browser.isChrome();
};

const isFirefox = function (platform: PlatformDetection) {
  return platform.browser.isFirefox();
};

const isIE11 = function (platform: PlatformDetection) {
  return isIE(platform) && platform.browser.version.major === 11;
};

const isIE = function (platform: PlatformDetection) {
  return platform.browser.isIE();
};

const isSafari = function (platform: PlatformDetection) {
  return platform.browser.isSafari();
};

const isOpera = function (platform: PlatformDetection) {
  return platform.browser.isOpera();
};

export default {
  isEdge: isEdge,
  isChrome: isChrome,
  isFirefox: isFirefox,
  isOpera: isOpera,
  isIE11: isIE11,
  isIE: isIE,
  isSafari: isSafari
};