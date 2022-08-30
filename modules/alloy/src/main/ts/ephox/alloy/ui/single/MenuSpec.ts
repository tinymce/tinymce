import { Arr, Optional } from '@ephox/katamari';
import { Attribute, Compare, SelectorFilter } from '@ephox/sugar';

import { Composing } from '../../api/behaviour/Composing';
import { Highlighting } from '../../api/behaviour/Highlighting';
import { Keying } from '../../api/behaviour/Keying';
import { Representing } from '../../api/behaviour/Representing';
import { Toggling } from '../../api/behaviour/Toggling';
import { AlloyComponent } from '../../api/component/ComponentApi';
import * as SketchBehaviours from '../../api/component/SketchBehaviours';
import * as AlloyEvents from '../../api/events/AlloyEvents';
import * as AlloyTriggers from '../../api/events/AlloyTriggers';
import { CompositeSketchFactory } from '../../api/ui/UiSketcher';
import * as ItemEvents from '../../menu/util/ItemEvents';
import * as MenuEvents from '../../menu/util/MenuEvents';
import { MenuDetail, MenuItemHoverEvent, MenuItemToggledEvent, MenuSpec } from '../types/MenuTypes';

const deselectOtherRadioItems = (menu: AlloyComponent, item: AlloyComponent): void => {
  // TODO: TINY-8812 - This ideally should be done in a way such that a menu can have multiple radio groups.
  const checkedRadioItems = SelectorFilter.descendants(menu.element, '[role="menuitemradio"][aria-checked="true"]');
  Arr.each(checkedRadioItems, (ele) => {
    if (!Compare.eq(ele, item.element)) {
      menu.getSystem().getByDom(ele).each((c) => {
        Toggling.off(c);
      });
    }
  });
};

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
        onHighlight: detail.onHighlight,
        onDehighlight: detail.onDehighlight
      }),
      Representing.config({
        store: {
          mode: 'memory',
          initialValue: detail.value
        }
      }),
      Composing.config({
        find: Optional.some
      }),
      Keying.config(detail.movement.config(detail, detail.movement))
    ]
  ),
  events: AlloyEvents.derive([
    // This is dispatched from a menu to tell an item to be highlighted.
    AlloyEvents.run(ItemEvents.focus(), (menu, simulatedEvent) => {
      // Highlight the item
      const event = simulatedEvent.event;
      menu.getSystem().getByDom(event.target).each((item) => {
        Highlighting.highlight(menu, item);

        simulatedEvent.stop();

        // Trigger the focus event on the menu.
        AlloyTriggers.emitWith(menu, MenuEvents.focus(), { menu, item });
      });
    }),

    // Highlight the item that the cursor is over. The onHighlight
    // code needs to handle updating focus if required
    AlloyEvents.run<MenuItemHoverEvent>(ItemEvents.hover(), (menu, simulatedEvent) => {
      const item = simulatedEvent.event.item;
      Highlighting.highlight(menu, item);
    }),

    // Enforce only a single radio menu item is toggled by finding any other toggled
    // radio menu items and untoggling them when a certain item is toggled
    AlloyEvents.run<MenuItemToggledEvent>(ItemEvents.toggled(), (menu, simulatedEvent) => {
      const { item, state } = simulatedEvent.event;
      if (state && Attribute.get(item.element, 'role') === 'menuitemradio') {
        deselectOtherRadioItems(menu, item);
      }
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
