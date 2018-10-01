import { Fun } from '@ephox/katamari';

const saveState = Fun.constant('save-state');
const disable = Fun.constant('disable');
const enable = Fun.constant('enable');

// TODO: dedupe these from ImageToolsEvents.ts in silver

export {
  saveState,
  disable,
  enable
};