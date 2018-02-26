import { Fun, Merger, Option } from '@ephox/katamari';

import DropdownUtils from '../../dropdown/DropdownUtils';
import ButtonBase from '../../ui/common/ButtonBase';
import DropdownSchema from '../../ui/schema/DropdownSchema';
import Behaviour from '../behaviour/Behaviour';
import Composing from '../behaviour/Composing';
import Coupling from '../behaviour/Coupling';
import Focusing from '../behaviour/Focusing';
import Highlighting from '../behaviour/Highlighting';
import Keying from '../behaviour/Keying';
import Toggling from '../behaviour/Toggling';
import SketchBehaviours from '../component/SketchBehaviours';
import Sketcher from './Sketcher';

const factory = function (detail, components, spec, externals) {
  const switchToMenu = function (sandbox) {
    Composing.getCurrent(sandbox).each(function (current) {
      Highlighting.highlightFirst(current);
      Keying.focusIn(current);
    });
  };

  const action = function (component) {
    const anchor = { anchor: 'hotspot', hotspot: component };
    const onOpenSync = switchToMenu;
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
      components,
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
              sandbox (hotspot) {
                return DropdownUtils.makeSandbox(detail, {
                  anchor: 'hotspot',
                  hotspot
                }, hotspot, {
                  onOpen () { Toggling.on(hotspot); },
                  onClose () { Toggling.off(hotspot); }
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
          'role': detail.role().getOr('button'),
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
  factory
});