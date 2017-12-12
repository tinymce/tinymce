import Behaviour from '../../api/behaviour/Behaviour';
import Composing from '../../api/behaviour/Composing';
import Highlighting from '../../api/behaviour/Highlighting';
import Keying from '../../api/behaviour/Keying';
import Representing from '../../api/behaviour/Representing';
import SketchBehaviours from '../../api/component/SketchBehaviours';
import AlloyEvents from '../../api/events/AlloyEvents';
import AlloyTriggers from '../../api/events/AlloyTriggers';
import ItemEvents from '../../menu/util/ItemEvents';
import MenuEvents from '../../menu/util/MenuEvents';
import { Fun } from '@ephox/katamari';
import { Merger } from '@ephox/katamari';

var make = function (detail, components, spec, externals) {
  return Merger.deepMerge(
    {
      dom: Merger.deepMerge(
        detail.dom(),
        {
          attributes: {
            role: 'menu'
          }
        }
      ),
      uid: detail.uid(),

      behaviours: Merger.deepMerge(
        Behaviour.derive([
          Highlighting.config({
            // Highlighting for a menu is selecting items inside the menu
            highlightClass: detail.markers().selectedItem(),
            itemClass: detail.markers().item(),
            onHighlight: detail.onHighlight()
          }),
          Representing.config({
            store: {
              mode: 'memory',
              initialValue: detail.value()
            }
          }),
          // FIX: Is this used? It has the wrong return type.
          Composing.config({
            find: Fun.identity
          }),
          Keying.config(detail.movement().config()(detail, detail.movement()))
        ]),
        SketchBehaviours.get(detail.menuBehaviours())
      ),
      events: AlloyEvents.derive([
        // This is dispatched from a menu to tell an item to be highlighted.
        AlloyEvents.run(ItemEvents.focus(), function (menu, simulatedEvent) {
          // Highlight the item
          var event = simulatedEvent.event();
          menu.getSystem().getByDom(event.target()).each(function (item) {
            Highlighting.highlight(menu, item);

            simulatedEvent.stop();

            // Trigger the focus event on the menu.
            AlloyTriggers.emitWith(menu, MenuEvents.focus(), { menu: menu, item: item });
          });
        }),

        // Highlight the item that the cursor is over. The onHighlight
        // code needs to handle updating focus if required
        AlloyEvents.run(ItemEvents.hover(), function (menu, simulatedEvent) {
          var item = simulatedEvent.event().item();
          Highlighting.highlight(menu, item);
        })
      ]),
      components: components,
      eventOrder: detail.eventOrder()
    }
  );
};

export default <any> {
  make: make
};