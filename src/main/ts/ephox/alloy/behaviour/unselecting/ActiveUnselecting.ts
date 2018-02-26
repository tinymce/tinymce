import { Fun } from '@ephox/katamari';

import * as AlloyEvents from '../../api/events/AlloyEvents';
import NativeEvents from '../../api/events/NativeEvents';
import DomModification from '../../dom/DomModification';

const exhibit = function (base, unselectConfig) {
  return DomModification.nu({
    styles: {
      '-webkit-user-select': 'none',
      'user-select': 'none',
      '-ms-user-select': 'none',
      '-moz-user-select': '-moz-none'
    },
    attributes: {
      unselectable: 'on'
    }
  });
};

const events = function (unselectConfig) {
  return AlloyEvents.derive([
    AlloyEvents.abort(NativeEvents.selectstart(), Fun.constant(true))
  ]);
};

export {
  events,
  exhibit
};