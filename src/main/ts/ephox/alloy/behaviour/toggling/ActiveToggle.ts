import AlloyEvents from '../../api/events/AlloyEvents';
import Behaviour from '../common/Behaviour';
import ToggleApis from './ToggleApis';
import DomModification from '../../dom/DomModification';
import { Arr } from '@ephox/katamari';

var exhibit = function (base, toggleConfig, toggleState) {
  return DomModification.nu({ });
};

var events = function (toggleConfig, toggleState) {
  var execute = Behaviour.executeEvent(toggleConfig, toggleState, ToggleApis.toggle);
  var load = Behaviour.loadEvent(toggleConfig, toggleState, ToggleApis.onLoad);

  return AlloyEvents.derive(
    Arr.flatten([
      toggleConfig.toggleOnExecute() ? [ execute ] : [ ],
      [ load ]
    ])
  );
};

export default <any> {
  exhibit: exhibit,
  events: events
};