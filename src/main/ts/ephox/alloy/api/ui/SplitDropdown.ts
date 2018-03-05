import { Fun, Merger, Option } from '@ephox/katamari';

import * as DropdownUtils from '../../dropdown/DropdownUtils';
import * as AlloyParts from '../../parts/AlloyParts';
import * as ButtonBase from '../../ui/common/ButtonBase';
import * as SplitDropdownSchema from '../../ui/schema/SplitDropdownSchema';
import * as Behaviour from '../behaviour/Behaviour';
import { Composing } from '../behaviour/Composing';
import { Coupling } from '../behaviour/Coupling';
import { Focusing } from '../behaviour/Focusing';
import { Highlighting } from '../behaviour/Highlighting';
import { Keying } from '../behaviour/Keying';
import { Toggling } from '../behaviour/Toggling';
import SketchBehaviours from '../component/SketchBehaviours';
import * as AlloyTriggers from '../events/AlloyTriggers';
import * as Sketcher from './Sketcher';

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

  const executeOnButton = function (comp) {
    const button = AlloyParts.getPartOrDie(comp, detail, 'button');
    AlloyTriggers.emitExecute(button);
    return Option.some(true);
  };

  const buttonEvents = ButtonBase.events(Option.some(action));

  return Merger.deepMerge(
    {
      uid: detail.uid(),
      dom: detail.dom(),
      components,
      eventOrder: {
        // Order, the button state is toggled first, so assumed !selected means close.
        'alloy.execute': [ 'toggling', 'alloy.base.behaviour' ]
      },

      events: buttonEvents,

      behaviours: Merger.deepMerge(
        Behaviour.derive([
          Coupling.config({
            others: {
              sandbox (hotspot) {
                const arrow = AlloyParts.getPartOrDie(hotspot, detail, 'arrow');
                const extras = {
                  onOpen () {
                    Toggling.on(arrow);
                  },
                  onClose () {
                    Toggling.off(arrow);
                  }
                };

                return DropdownUtils.makeSandbox(detail, {
                  anchor: 'hotspot',
                  hotspot
                }, hotspot, extras);
              }
            }
          }),
          Keying.config({
            mode: 'special',
            onSpace: executeOnButton,
            onEnter: executeOnButton,
            onDown (comp) {
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
  factory
});