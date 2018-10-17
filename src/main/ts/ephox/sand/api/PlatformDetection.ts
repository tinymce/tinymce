import { navigator } from '@ephox/dom-globals';
import { Thunk } from '@ephox/katamari';

import { PlatformDetection } from '../core/PlatformDetection';

const detect: () => PlatformDetection = Thunk.cached(function () {
  const userAgent = navigator.userAgent;
  return PlatformDetection.detect(userAgent);
});

export default {
  detect
};