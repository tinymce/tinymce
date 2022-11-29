import { Class, Classes } from '@ephox/sugar';

import * as AlloyEvents from '../../api/events/AlloyEvents';
import * as NativeEvents from '../../api/events/NativeEvents';
import * as SystemEvents from '../../api/events/SystemEvents';
import * as DockingApis from './DockingApis';
import { DockingConfig, DockingState } from './DockingTypes';

const events = (dockInfo: DockingConfig, dockState: DockingState): AlloyEvents.AlloyEventRecord =>
  AlloyEvents.derive([
    AlloyEvents.runOnSource(NativeEvents.transitionend(), (component, simulatedEvent) => {
      dockInfo.contextual.each((contextInfo) => {
        if (Class.has(component.element, contextInfo.transitionClass)) {
          Classes.remove(component.element, [ contextInfo.transitionClass, contextInfo.fadeInClass ]);
          const notify = dockState.isVisible() ? contextInfo.onShown : contextInfo.onHidden;
          notify(component);
        }
        simulatedEvent.stop();
      });
    }),

    AlloyEvents.run(SystemEvents.windowScroll(), (component, _) => {
      DockingApis.refresh(component, dockInfo, dockState);
    }),

    AlloyEvents.run(SystemEvents.externalElementScroll(), (component, _) => {
      DockingApis.refresh(component, dockInfo, dockState);
    }),

    AlloyEvents.run(SystemEvents.windowResize(), (component, _) => {
      DockingApis.reset(component, dockInfo, dockState);
    })
  ]);

export { events };
