import Behaviour from '../behaviour/Behaviour';
import Composing from '../behaviour/Composing';
import Coupling from '../behaviour/Coupling';
import Focusing from '../behaviour/Focusing';
import Highlighting from '../behaviour/Highlighting';
import Keying from '../behaviour/Keying';
import Toggling from '../behaviour/Toggling';
import SketchBehaviours from '../component/SketchBehaviours';
import AlloyTriggers from '../events/AlloyTriggers';
import Sketcher from './Sketcher';
import DropdownUtils from '../../dropdown/DropdownUtils';
import AlloyParts from '../../parts/AlloyParts';
import ButtonBase from '../../ui/common/ButtonBase';
import SplitDropdownSchema from '../../ui/schema/SplitDropdownSchema';
import { Fun } from '@ephox/katamari';
import { Merger } from '@ephox/katamari';
import { Option } from '@ephox/katamari';

var factory = function (detail, components, spec, externals) {

  var switchToMenu = function (sandbox) {
    Composing.getCurrent(sandbox).each(function (current) {
      Highlighting.highlightFirst(current);
      Keying.focusIn(current);
    });
  };

  var action = function (component) {
    var anchor = { anchor: 'hotspot', hotspot: component };
    var onOpenSync = switchToMenu;
    DropdownUtils.togglePopup(detail, anchor, component, externals, onOpenSync).get(Fun.noop);
  };

  var executeOnButton = function (comp) {
    var button = AlloyParts.getPartOrDie(comp, detail, 'button');
    AlloyTriggers.emitExecute(button);
    return Option.some(true);
  };

  var buttonEvents = ButtonBase.events(Option.some(action));

  return Merger.deepMerge(
    {
      uid: detail.uid(),
      dom: detail.dom(),
      components: components,
      eventOrder: {
        // Order, the button state is toggled first, so assumed !selected means close.
        'alloy.execute': [ 'toggling', 'alloy.base.behaviour' ]
      },

      events: buttonEvents,

      behaviours: Merger.deepMerge(
        Behaviour.derive([
          Coupling.config({
            others: {
              sandbox: function (hotspot) {
                var arrow = AlloyParts.getPartOrDie(hotspot, detail, 'arrow');
                var extras = {
                  onOpen: function () {
                    Toggling.on(arrow);
                  },
                  onClose: function () {
                    Toggling.off(arrow);
                  }
                };

                return DropdownUtils.makeSandbox(detail, {
                  anchor: 'hotspot',
                  hotspot: hotspot
                }, hotspot, extras);
              }
            }
          }),
          Keying.config({
            mode: 'special',
            onSpace: executeOnButton,
            onEnter: executeOnButton,
            onDown: function (comp) {
              action(comp);
              return Option.some(true);
            }
          }),
          Focusing.config({ })
        ]),
        SketchBehaviours.get(detail.splitDropdownBehaviours())
      )
    },
    {
      dom: {
        attributes: {
          role: 'presentation'
        }
      }
    }
  );
};

export default <any> Sketcher.composite({
  name: 'SplitDropdown',
  configFields: SplitDropdownSchema.schema(),
  partFields: SplitDropdownSchema.parts(),
  factory: factory
});