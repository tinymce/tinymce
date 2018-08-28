import { navigator } from '@ephox/dom-globals';
import { Thunk } from '@ephox/katamari';

import PlatformDetection from '../core/PlatformDetection';

var detect = Thunk.cached(function () {
  var userAgent = navigator.userAgent;
  return PlatformDetection.detect(userAgent);
});

export default <any> {
  detect: detect
};