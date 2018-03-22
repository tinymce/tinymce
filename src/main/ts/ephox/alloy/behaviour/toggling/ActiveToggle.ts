import { Arr } from '@ephox/katamari';

import * as AlloyEvents from '../../api/events/AlloyEvents';
import * as DomModification from '../../dom/DomModification';
import * as Behaviour from '../common/Behaviour';
import * as ToggleApis from './ToggleApis';

const exhibit = function (base, toggleConfig, toggleState) {
  return DomModification.nu({ });
};

const events = function (toggleConfig, toggleState) {
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