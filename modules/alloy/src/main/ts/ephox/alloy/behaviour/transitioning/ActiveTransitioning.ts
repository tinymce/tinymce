import { EventArgs } from '@ephox/sugar';

import * as AlloyEvents from '../../api/events/AlloyEvents';
import * as NativeEvents from '../../api/events/NativeEvents';
import { Stateless } from '../common/BehaviourState';
import * as TransitionApis from './TransitionApis';
import { TransitioningConfig } from './TransitioningTypes';

const events = (transConfig: TransitioningConfig, transState: Stateless): AlloyEvents.AlloyEventRecord => AlloyEvents.derive([
  AlloyEvents.run<EventArgs<TransitionEvent>>(NativeEvents.transitionend(), (component, simulatedEvent) => {
    const raw = simulatedEvent.event.raw;
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

  AlloyEvents.runOnAttached((comp, _se) => {
    TransitionApis.jumpTo(comp, transConfig, transState, transConfig.initialState);
  })
]);

export {
  events
};
