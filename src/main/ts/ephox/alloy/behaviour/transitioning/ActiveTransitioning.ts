import { TransitionEvent } from '@ephox/dom-globals';

import { SugarEvent } from '../../alien/TypeDefinitions';
import * as AlloyEvents from '../../api/events/AlloyEvents';
import * as NativeEvents from '../../api/events/NativeEvents';
import { Stateless } from '../../behaviour/common/BehaviourState';
import { TransitioningConfig } from '../../behaviour/transitioning/TransitioningTypes';
import * as TransitionApis from './TransitionApis';

const events = (transConfig: TransitioningConfig, transState: Stateless): AlloyEvents.AlloyEventRecord => {
  return AlloyEvents.derive([
    AlloyEvents.run<SugarEvent>(NativeEvents.transitionend(), (component, simulatedEvent) => {
      const raw = simulatedEvent.event().raw() as TransitionEvent;
      TransitionApis.getCurrentRoute(component, transConfig, transState).each((route) => {
        TransitionApis.findRoute(component, transConfig, transState, route).each((rInfo) => {
          rInfo.transition.each((rTransition) => {
            if (raw.propertyName === rTransition.property) {
              TransitionApis.jumpTo(component, transConfig, transState, route.destination);
              transConfig.onTransition(component, route);
            }
          });
        });
      });
    }),

    AlloyEvents.runOnAttached((comp, se) => {
      TransitionApis.jumpTo(comp, transConfig, transState, transConfig.initialState);
    })
  ]);
};

export {
  events
};