import { Option } from '@ephox/katamari';

import { Composing } from '../../api/behaviour/Composing';
import { Highlighting } from '../../api/behaviour/Highlighting';
import { Keying } from '../../api/behaviour/Keying';
import { Representing } from '../../api/behaviour/Representing';
import * as SketchBehaviours from '../../api/component/SketchBehaviours';
import * as AlloyEvents from '../../api/events/AlloyEvents';
import * as AlloyTriggers from '../../api/events/AlloyTriggers';
import { CompositeSketchFactory } from '../../api/ui/UiSketcher';
import * as ItemEvents from '../../menu/util/ItemEvents';
import * as MenuEvents from '../../menu/util/MenuEvents';
import { MenuDetail, MenuItemHoverEvent, MenuSpec } from '../types/MenuTypes';

const make: CompositeSketchFactory<MenuDetail, MenuSpec> = (detail, components, _spec, _externals) => ({
  uid: detail.uid,
  dom: detail.dom,
  markers: detail.markers,

  behaviours: SketchBehaviours.augment(
    detail.menuBehaviours,
    [
      Highlighting.config({
        // Highlighting for a menu is selecting items inside the menu
        highlightClass: detail.markers.selectedItem,
        itemClass: detail.markers.item,
        onHighlight: detail.onHighlight
      }),
      Representing.config({
        store: {
          mode: 'memory',
          initialValue: detail.value
        }
      }),
      Composing.config({
        find: Option.some
      }),
      Keying.config(detail.movement.config(detail, detail.movement))
    ]
  ),
  events: AlloyEvents.derive([
    // This is dispatched from a menu to tell an item to be highlighted.
    AlloyEvents.run(ItemEvents.focus(), (menu, simulatedEvent) => {
      // Highlight the item
      const event = simulatedEvent.event();
      menu.getSystem().getByDom(event.target()).each((item) => {
        Highlighting.highlight(menu, item);

        simulatedEvent.stop();

        // Trigger the focus event on the menu.
        AlloyTriggers.emitWith(menu, MenuEvents.focus(), { menu, item });
      });
    }),

    // Highlight the item that the cursor is over. The onHighlight
    // code needs to handle updating focus if required
    AlloyEvents.run<MenuItemHoverEvent>(ItemEvents.hover(), (menu, simulatedEvent) => {
      const item = simulatedEvent.event().item();
      Highlighting.highlight(menu, item);
    })
  ]),
  components,
  eventOrder: detail.eventOrder,

  domModification: {
    attributes: {
      role: 'menu'
    }
  }
});

export {
  make
};
