import { Arr } from '@ephox/katamari';

import * as AlloyEvents from '../../api/events/AlloyEvents';
import * as DomModification from '../../dom/DomModification';
import * as Behaviour from '../common/Behaviour';
import * as ToggleApis from './ToggleApis';
import { TogglingConfig } from 'ephox/alloy/behaviour/toggling/TogglingTypes';
import { Stateless } from 'ephox/alloy/behaviour/common/NoState';
import { EventFormat } from '../../events/SimulatedEvent';

const exhibit = function (base: { }, toggleConfig: TogglingConfig, toggleState: Stateless): { } {
  return DomModification.nu({ });
};

const events = function (toggleConfig: TogglingConfig, toggleState: Stateless): AlloyEvents.EventHandlerConfigRecord {
  const execute = Behaviour.executeEvent(toggleConfig, toggleState, ToggleApis.toggle);
  const load = Behaviour.loadEvent(toggleConfig, toggleState, ToggleApis.onLoad);

  return AlloyEvents.derive(
    Arr.flatten([
      toggleConfig.toggleOnExecute() ? [ execute ] : [ ],
      [ load ]
    ])
  );
};

export {
  exhibit,
  events
};