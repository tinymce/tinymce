import { Fun } from '@ephox/katamari';

const closeTooltips = Fun.constant('tooltipping.close.all');
const dismissPopups = Fun.constant('dismiss.popups');
const repositionPopups = Fun.constant('reposition.popups');
const mouseReleased = Fun.constant('mouse.released');

export {
  closeTooltips,
  dismissPopups,
  mouseReleased,
  repositionPopups
};
