import { Fun, Id, Option, Merger } from '@ephox/katamari';
import { Attr } from '@ephox/sugar';

import * as AlloyEvents from '../../api/events/AlloyEvents';
import * as DropdownUtils from '../../dropdown/DropdownUtils';
import * as AlloyParts from '../../parts/AlloyParts';
import * as ButtonBase from '../../ui/common/ButtonBase';
import * as SplitDropdownSchema from '../../ui/schema/SplitDropdownSchema';
import { SplitDropdownApis, SplitDropdownDetail, SplitDropdownSketcher, SplitDropdownSpec } from '../../ui/types/SplitDropdownTypes';
import { Composing } from '../behaviour/Composing';
import { Coupling } from '../behaviour/Coupling';
import { Focusing } from '../behaviour/Focusing';
import { Highlighting } from '../behaviour/Highlighting';
import { Keying } from '../behaviour/Keying';
import { Toggling } from '../behaviour/Toggling';
import * as SketchBehaviours from '../component/SketchBehaviours';
import * as AlloyTriggers from '../events/AlloyTriggers';
import * as Sketcher from './Sketcher';
import { CompositeSketchFactory } from './UiSketcher';

const factory: CompositeSketchFactory<SplitDropdownDetail, SplitDropdownSpec> = (detail, components, spec, externals) => {

  const switchToMenu = (sandbox) => {
    Composing.getCurrent(sandbox).each((current) => {
      Highlighting.highlightFirst(current);
      Keying.focusIn(current);
    });
  };

  const action = (component) => {
    const onOpenSync = switchToMenu;
    DropdownUtils.togglePopup(detail, (x) => x, component, externals, onOpenSync, DropdownUtils.HighlightOnOpen.HighlightFirst).get(Fun.noop);
  };

  const openMenu = (comp) => {
    action(comp);
    return Option.some(true);
  };

  const executeOnButton = (comp) => {
    const button = AlloyParts.getPartOrDie(comp, detail, 'button');
    AlloyTriggers.emitExecute(button);
    return Option.some(true);
  };

  const buttonEvents = Merger.merge(
    AlloyEvents.derive([
      AlloyEvents.runOnAttached((component, simulatedEvent) => {
        const ariaDescriptor = AlloyParts.getPart(component, detail, 'aria-descriptor');
        ariaDescriptor.each((descriptor) => {
          const descriptorId = Id.generate('aria');
          Attr.set(descriptor.element(), 'id', descriptorId);
          Attr.set(component.element(), 'aria-describedby', descriptorId);
        });
      }),
    ]),
    ButtonBase.events(Option.some(action))
  );

  const apis: SplitDropdownApis = {
    repositionMenus: (comp) => {
      if (Toggling.isOn(comp)) {
        DropdownUtils.repositionMenus(comp);
      }
    }
  };

  return {
    uid: detail.uid,
    dom: detail.dom,
    components,
    apis,
    eventOrder: {
      ...detail.eventOrder,
      // Order, the button state is toggled first, so assumed !selected means close.
      'alloy.execute': [ 'disabling', 'toggling', 'alloy.base.behaviour' ]
    },

    events: buttonEvents,

    behaviours: SketchBehaviours.augment(
      detail.splitDropdownBehaviours,
      [
        Coupling.config({
          others: {
            sandbox (hotspot) {
              const arrow = AlloyParts.getPartOrDie(hotspot, detail, 'arrow');
              const extras = {
                onOpen () {
                  Toggling.on(arrow);
                  Toggling.on(hotspot);
                },
                onClose () {
                  Toggling.off(arrow);
                  Toggling.off(hotspot);
                }
              };

              return DropdownUtils.makeSandbox(detail, hotspot, extras);
            }
          }
        }),
        Keying.config({
          mode: 'special',
          onSpace: executeOnButton,
          onEnter: executeOnButton,
          onDown: openMenu
        }),
        Focusing.config({ }),
        Toggling.config({
          toggleOnExecute: false,
          aria: {
            mode: 'expanded'
          }
        })
      ]
    ),

    domModification: {
      attributes: {
        'role': detail.role.getOr('button'),
        'aria-haspopup': true
      }
    }
  };
};

const SplitDropdown = Sketcher.composite({
  name: 'SplitDropdown',
  configFields: SplitDropdownSchema.schema(),
  partFields: SplitDropdownSchema.parts(),
  factory,
  apis: {
    repositionMenus: (apis: SplitDropdownApis, comp) => apis.repositionMenus(comp)
  }
}) as SplitDropdownSketcher;

export {
  SplitDropdown
};
