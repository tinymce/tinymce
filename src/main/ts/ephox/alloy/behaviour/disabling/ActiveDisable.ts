import { Arr } from '@ephox/katamari';

import * as AlloyEvents from '../../api/events/AlloyEvents';
import * as SystemEvents from '../../api/events/SystemEvents';
import * as DomModification from '../../dom/DomModification';
import * as Behaviour from '../common/Behaviour';
import * as DisableApis from './DisableApis';
import { EventFormat } from '../../events/SimulatedEvent';

const exhibit = function (base, disableConfig, disableState) {
  return DomModification.nu({
    // Do not add the attribute yet, because it will depend on the node name
    // if we use "aria-disabled" or just "disabled"
    classes: disableConfig.disabled() ? disableConfig.disableClass().map(Arr.pure).getOr([ ]) : [ ]
  });
};

const events = function (disableConfig, disableState) {
  return AlloyEvents.derive([
    AlloyEvents.abort(SystemEvents.execute(), function (component, simulatedEvent) {
      return DisableApis.isDisabled(component);
    }),
    Behaviour.loadEvent(disableConfig, disableState, DisableApis.onLoad)
  ]);
};

export {
  exhibit,
  events
};