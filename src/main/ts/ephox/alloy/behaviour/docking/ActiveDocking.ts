import Boxes from '../../alien/Boxes';
import OffsetOrigin from '../../alien/OffsetOrigin';
import DragCoord from '../../api/data/DragCoord';
import AlloyEvents from '../../api/events/AlloyEvents';
import NativeEvents from '../../api/events/NativeEvents';
import SystemEvents from '../../api/events/SystemEvents';
import Dockables from './Dockables';
import { Compare } from '@ephox/sugar';
import { Class } from '@ephox/sugar';
import { Css } from '@ephox/sugar';
import { Traverse } from '@ephox/sugar';
import { Scroll } from '@ephox/sugar';

var events = function (dockInfo) {
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
      var viewport = dockInfo.lazyViewport()(component);


      dockInfo.contextual().each(function (contextInfo) {
        // Make the dockable component disappear if the context is outside the viewport
        contextInfo.lazyContext()(component).each(function (elem) {
          var box = Boxes.box(elem);
          var isVisible = Dockables.isPartiallyVisible(box, viewport);
          var method = isVisible ? Dockables.appear : Dockables.disappear;
          method(component, contextInfo);
        });
      });

      var doc = Traverse.owner(component.element());
      var scroll = Scroll.get(doc);
      var origin = OffsetOrigin.getOrigin(component.element(), scroll);

      Dockables.getMorph(component, dockInfo, viewport, scroll, origin).each(function (morph) {
        var styles = DragCoord.toStyles(morph, scroll, origin);
        Css.setAll(component.element(), styles);
      });
    })
  ]);
};

export default <any> {
  events: events
};