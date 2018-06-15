import { Class, Compare, Css, Scroll, Traverse } from '@ephox/sugar';

import * as Boxes from '../../alien/Boxes';
import * as OffsetOrigin from '../../alien/OffsetOrigin';
import * as DragCoord from '../../api/data/DragCoord';
import * as AlloyEvents from '../../api/events/AlloyEvents';
import * as NativeEvents from '../../api/events/NativeEvents';
import * as SystemEvents from '../../api/events/SystemEvents';
import * as Dockables from './Dockables';
import { DockingConfig } from '../../behaviour/docking/DockingTypes';
import { EventFormat } from '../../events/SimulatedEvent';

const events = (dockInfo: DockingConfig) => {
  return AlloyEvents.derive([
    AlloyEvents.run(NativeEvents.transitionend(), (component, simulatedEvent) => {
      dockInfo.contextual().each((contextInfo) => {
        if (Compare.eq(component.element(), simulatedEvent.event().target())) {
          Class.remove(component.element(), contextInfo.transitionClass());
          simulatedEvent.stop();
        }
      });
    }),

    AlloyEvents.run(SystemEvents.windowScroll(), (component, simulatedEvent) => {
      // Absolute coordinates (considers scroll)
      const viewport = dockInfo.lazyViewport()(component);

      dockInfo.contextual().each((contextInfo) => {
        // Make the dockable component disappear if the context is outside the viewport
        contextInfo.lazyContext()(component).each((elem) => {
          const box = Boxes.box(elem);
          const isVisible = Dockables.isPartiallyVisible(box, viewport);
          const method = isVisible ? Dockables.appear : Dockables.disappear;
          method(component, contextInfo);
        });
      });

      const doc = Traverse.owner(component.element());
      const scroll = Scroll.get(doc);
      const origin = OffsetOrigin.getOrigin(component.element(), scroll);

      Dockables.getMorph(component, dockInfo, viewport, scroll, origin).each((morph) => {
        const styles = DragCoord.toStyles(morph, scroll, origin);
        Css.setAll(component.element(), styles);
      });
    })
  ]);
};

export {
  events
};