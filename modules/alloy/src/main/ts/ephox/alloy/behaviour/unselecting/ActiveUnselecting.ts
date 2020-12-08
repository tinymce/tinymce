import { Fun } from '@ephox/katamari';

import * as AlloyEvents from '../../api/events/AlloyEvents';
import * as NativeEvents from '../../api/events/NativeEvents';
import * as DomModification from '../../dom/DomModification';

const exhibit = (): DomModification.DomModification =>
  DomModification.nu({
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

const events = (): AlloyEvents.AlloyEventRecord => AlloyEvents.derive([
  AlloyEvents.abort(NativeEvents.selectstart(), Fun.always)
]);

export {
  events,
  exhibit
};
