import AlloyEvents from '../../api/events/AlloyEvents';
import NativeEvents from '../../api/events/NativeEvents';
import DomModification from '../../dom/DomModification';
import { Fun } from '@ephox/katamari';

var exhibit = function (base, unselectConfig) {
  return DomModification.nu({
    styles: {
      '-webkit-user-select': 'none',
      'user-select': 'none',
      '-ms-user-select': 'none',
      '-moz-user-select': '-moz-none'
    },
    attributes: {
      'unselectable': 'on'
    }
  });
};

var events = function (unselectConfig) {
  return AlloyEvents.derive([
    AlloyEvents.abort(NativeEvents.selectstart(), Fun.constant(true))
  ]);
};

export default <any> {
  events: events,
  exhibit: exhibit
};