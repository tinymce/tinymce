import { Class, Compare, Css, Scroll, Traverse } from '@ephox/sugar';

import * as Boxes from '../../alien/Boxes';
import OffsetOrigin from '../../alien/OffsetOrigin';
import * as DragCoord from '../../api/data/DragCoord';
import * as AlloyEvents from '../../api/events/AlloyEvents';
import NativeEvents from '../../api/events/NativeEvents';
import SystemEvents from '../../api/events/SystemEvents';
import * as Dockables from './Dockables';

const events = function (dockInfo) {
  return AlloyEvents.derive([
    AlloyEvents.run(NativeEvents.transitionend(), function (component, simulatedEvent) {
      dockInfo.contextual().each(function (contextInfo) {
        if (Compare.eq(component.element(), simulatedEvent.event().target())) {
          Class.remove(component.element(), contextInfo.transitionClass());
          simulatedEvent.stop();
        }
      });
    }),

    AlloyEvents.run(SystemEvents.windowScroll(), function (component, simulatedEvent) {
      // Absolute coordinates (considers scroll)
      const viewport = dockInfo.lazyViewport()(component);

      dockInfo.contextual().each(function (contextInfo) {
        // Make the dockable component disappear if the context is outside the viewport
        contextInfo.lazyContext()(component).each(function (elem) {
          const box = Boxes.box(elem);
          const isVisible = Dockables.isPartiallyVisible(box, viewport);
          const method = isVisible ? Dockables.appear : Dockables.disappear;
          method(component, contextInfo);
        });
      });

      const doc = Traverse.owner(component.element());
      const scroll = Scroll.get(doc);
      const origin = OffsetOrigin.getOrigin(component.element(), scroll);

      Dockables.getMorph(component, dockInfo, viewport, scroll, origin).each(function (morph) {
        const styles = DragCoord.toStyles(morph, scroll, origin);
        Css.setAll(component.element(), styles);
      });
    })
  ]);
};

export {
  events
};