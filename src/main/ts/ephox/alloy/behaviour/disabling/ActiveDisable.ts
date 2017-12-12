import AlloyEvents from '../../api/events/AlloyEvents';
import SystemEvents from '../../api/events/SystemEvents';
import Behaviour from '../common/Behaviour';
import DisableApis from './DisableApis';
import DomModification from '../../dom/DomModification';
import { Arr } from '@ephox/katamari';

var exhibit = function (base, disableConfig, disableState) {
  return DomModification.nu({
    // Do not add the attribute yet, because it will depend on the node name
    // if we use "aria-disabled" or just "disabled"
    classes: disableConfig.disabled() ? disableConfig.disableClass().map(Arr.pure).getOr([ ]) : [ ]
  });
};

var events = function (disableConfig, disableState) {
  return AlloyEvents.derive([
    AlloyEvents.abort(SystemEvents.execute(), function (component, simulatedEvent) {
      return DisableApis.isDisabled(component, disableConfig, disableState);
    }),
    Behaviour.loadEvent(disableConfig, disableState, DisableApis.onLoad)
  ]);
};

export default <any> {
  exhibit: exhibit,
  events: events
};