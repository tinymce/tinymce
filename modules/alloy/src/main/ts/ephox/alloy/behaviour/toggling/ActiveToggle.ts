import { Arr } from '@ephox/katamari';

import * as AlloyEvents from '../../api/events/AlloyEvents';
import * as DomModification from '../../dom/DomModification';
import * as Behaviour from '../common/Behaviour';
import * as ToggleApis from './ToggleApis';
import { TogglingConfig, TogglingState } from '../../behaviour/toggling/TogglingTypes';
import { Stateless } from '../../behaviour/common/BehaviourState';
import { EventFormat } from '../../events/SimulatedEvent';

const exhibit = (base: { }, toggleConfig: TogglingConfig, toggleState: TogglingState): { } => {
  return DomModification.nu({ });
};

const events = (toggleConfig: TogglingConfig, toggleState: TogglingState): AlloyEvents.AlloyEventRecord => {
  const execute = Behaviour.executeEvent(toggleConfig, toggleState, ToggleApis.toggle);
  const load = Behaviour.loadEvent(toggleConfig, toggleState, ToggleApis.onLoad);

  return AlloyEvents.derive(
    Arr.flatten([
      toggleConfig.toggleOnExecute ? [ execute ] : [ ],
      [ load ]
    ])
  );
};

export {
  exhibit,
  events
};