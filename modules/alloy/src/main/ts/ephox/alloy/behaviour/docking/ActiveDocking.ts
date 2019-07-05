import { Class, Compare } from '@ephox/sugar';

import * as AlloyEvents from '../../api/events/AlloyEvents';
import * as NativeEvents from '../../api/events/NativeEvents';
import * as SystemEvents from '../../api/events/SystemEvents';
import * as DockingApis from './DockingApis';
import { DockingConfig } from './DockingTypes';

const events = (dockInfo: DockingConfig, dockState) => {
  return AlloyEvents.derive([
    AlloyEvents.run(NativeEvents.transitionend(), (component, simulatedEvent) => {
      dockInfo.contextual.each((contextInfo) => {
        if (Compare.eq(component.element(), simulatedEvent.event().target())) {
          Class.remove(component.element(), contextInfo.transitionClass);
          simulatedEvent.stop();
        }
      });
    }),

    AlloyEvents.run(SystemEvents.windowScroll(), (component, _) => {
      DockingApis.refresh(component, dockInfo, dockState);
    })
  ]);
};

export { events };
