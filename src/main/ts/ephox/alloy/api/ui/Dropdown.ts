import Behaviour from '../behaviour/Behaviour';
import Composing from '../behaviour/Composing';
import Coupling from '../behaviour/Coupling';
import Focusing from '../behaviour/Focusing';
import Highlighting from '../behaviour/Highlighting';
import Keying from '../behaviour/Keying';
import Toggling from '../behaviour/Toggling';
import SketchBehaviours from '../component/SketchBehaviours';
import Sketcher from './Sketcher';
import DropdownUtils from '../../dropdown/DropdownUtils';
import ButtonBase from '../../ui/common/ButtonBase';
import DropdownSchema from '../../ui/schema/DropdownSchema';
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

  return Merger.deepMerge(
    {
      events: ButtonBase.events(
        Option.some(action)
      )
    },
    {
      uid: detail.uid(),
      dom: detail.dom(),
      components: components,
      behaviours: Merger.deepMerge(
        Behaviour.derive([
          Toggling.config({
            toggleClass: detail.toggleClass(),
            aria: {
              // INVESTIGATE: Are we sure we want aria-pressed as well as aria-expanded here?
              mode: 'pressed',
              syncWithExpanded: true
            }
          }),
          Coupling.config({
            others: {
              sandbox: function (hotspot) {
                return DropdownUtils.makeSandbox(detail, {
                  anchor: 'hotspot',
                  hotspot: hotspot
                }, hotspot, {
                  onOpen: function () { Toggling.on(hotspot); },
                  onClose: function () { Toggling.off(hotspot); }
                });
              }
            }
          }),
          Keying.config({
            mode: 'execution',
            useSpace: true
          }),
          Focusing.config({ })
        ]),
        SketchBehaviours.get(detail.dropdownBehaviours())
      ),

      eventOrder: {
        // Order, the button state is toggled first, so assumed !selected means close.
        'alloy.execute': [ 'toggling', 'alloy.base.behaviour' ]
      }
    },
    {
      dom: {
        attributes: {
          role: detail.role().getOr('button'),
          'aria-haspopup': 'true'
        }
      }
    }
  );
};

export default <any> Sketcher.composite({
  name: 'Dropdown',
  configFields: DropdownSchema.schema(),
  partFields: DropdownSchema.parts(),
  factory: factory
});