import { Arr } from '@ephox/katamari';

import * as AlloyEvents from '../../api/events/AlloyEvents';
import * as SystemEvents from '../../api/events/SystemEvents';
import { DomDefinitionDetail } from '../../dom/DomDefinition';
import * as DomModification from '../../dom/DomModification';
import * as Behaviour from '../common/Behaviour';
import { Stateless } from '../common/BehaviourState';
import * as DisableApis from './DisableApis';
import { DisableConfig } from './DisableTypes';

const exhibit = (base: DomDefinitionDetail, disableConfig: DisableConfig) => {
  return DomModification.nu({
    // Do not add the attribute yet, because it will depend on the node name
    // if we use "aria-disabled" or just "disabled"
    classes: disableConfig.disabled ? disableConfig.disableClass.map(Arr.pure).getOr([ ]) : [ ]
  });
};

const events = (disableConfig: DisableConfig, disableState: Stateless) => {
  return AlloyEvents.derive([
    AlloyEvents.abort(SystemEvents.execute(), (component, simulatedEvent) => {
      return DisableApis.isDisabled(component, disableConfig);
    }),
    Behaviour.loadEvent(disableConfig, disableState, DisableApis.onLoad)
  ]);
};

export {
  exhibit,
  events
};
