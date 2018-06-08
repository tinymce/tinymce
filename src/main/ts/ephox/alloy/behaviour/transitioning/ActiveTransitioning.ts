import * as AlloyEvents from '../../api/events/AlloyEvents';
import * as NativeEvents from '../../api/events/NativeEvents';
import * as TransitionApis from './TransitionApis';
import { TransitioningConfig } from '../../behaviour/transitioning/TransitioningTypes';
import { Stateless } from '../../behaviour/common/NoState';

import { EventFormat } from '../../events/SimulatedEvent';

const events = function (transConfig: TransitioningConfig, transState: Stateless): AlloyEvents.EventHandlerConfigRecord {
  return AlloyEvents.derive([
    AlloyEvents.run(NativeEvents.transitionend(), function (component, simulatedEvent) {
      const raw = simulatedEvent.event().raw();
      TransitionApis.getCurrentRoute(component, transConfig, transState).each(function (route) {
        TransitionApis.findRoute(component, transConfig, transState, route).each(function (rInfo) {
          rInfo.transition().each(function (rTransition) {
            if (raw.propertyName === rTransition.property()) {
              TransitionApis.jumpTo(component, transConfig, transState, route.destination());
              transConfig.onTransition()(component, route);
            }
          });
        });
      });
    }),

    AlloyEvents.runOnAttached(function (comp, se) {
      TransitionApis.jumpTo(comp, transConfig, transState, transConfig.initialState());
    })
  ]);
};

export {
  events
};