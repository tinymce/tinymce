import { document } from '@ephox/dom-globals';
import { Cell } from '@ephox/katamari';

import { detect } from '../api/PlatformDetection';

// Store if we think we're on a touch device and then add an event listener that only
// fires once when a touch event occurs to detect if we're actually using a touch device
// Note: Don't use sugar here, as that'll cause a circular dependency
const touch = Cell(detect().deviceType.isTouch());
const onTouch = () => {
  touch.set(true);
  document.removeEventListener('touchstart', onTouch);
};
document.addEventListener('touchstart', onTouch, true);

export const isTouch = touch.get;
