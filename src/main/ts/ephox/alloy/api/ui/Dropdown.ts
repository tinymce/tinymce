import { Fun, Merger, Option } from '@ephox/katamari';

import { AlloySpec, SketchSpec } from '../../api/component/SpecTypes';
import { CompositeSketchFactory } from '../../api/ui/UiSketcher';
import * as DropdownUtils from '../../dropdown/DropdownUtils';
import * as ButtonBase from '../../ui/common/ButtonBase';
import * as DropdownSchema from '../../ui/schema/DropdownSchema';
import { DropdownDetail, DropdownSketcher, DropdownSpec, DropdownApis } from '../../ui/types/DropdownTypes';
import * as Behaviour from '../behaviour/Behaviour';
import { Composing } from '../behaviour/Composing';
import { Coupling } from '../behaviour/Coupling';
import { Focusing } from '../behaviour/Focusing';
import { Highlighting } from '../behaviour/Highlighting';
import { Keying } from '../behaviour/Keying';
import { Toggling } from '../behaviour/Toggling';
import * as SketchBehaviours from '../component/SketchBehaviours';
import * as Sketcher from './Sketcher';
import { HotspotAnchorSpec } from '../../positioning/mode/Anchoring';
import { AlloyComponent } from '../../api/component/ComponentApi';
import { SimulatedEvent, AlloyTriggers } from '../Main';
import { SugarEvent } from '../../alien/TypeDefinitions';

const factory: CompositeSketchFactory<DropdownDetail, DropdownSpec> = (detail, components: AlloySpec[], _spec: DropdownSpec, externals): SketchSpec => {
  const switchToMenu = (sandbox) => {
    Composing.getCurrent(sandbox).each((current) => {
      Highlighting.highlightFirst(current);
      Keying.focusIn(current);
    });
  };

  const action = (component: AlloyComponent): void => {
    const onOpenSync = switchToMenu;
    DropdownUtils.togglePopup(detail, (x) => x, component, externals, onOpenSync).get(Fun.noop);
  };

  const apis: DropdownApis = {
    openAndFocus: (comp) => {
      if (! Toggling.isOn(comp)) {
        action(comp);
      }
    },
    open: (comp) => {
      if (! Toggling.isOn(comp)) {
        DropdownUtils.togglePopup(detail, (x) => x, comp, externals, Fun.noop).get(Fun.noop);
      }
    },
    isOpen: Toggling.isOn,
    close: (comp) => {
      if (Toggling.isOn(comp)) {
        DropdownUtils.togglePopup(detail, (x) => x, comp, externals, Fun.noop).get(Fun.noop);
      }
    }
  };

  const triggerExecute = (comp: AlloyComponent, se: SimulatedEvent<SugarEvent>): Option<boolean> => {
    AlloyTriggers.emitExecute(comp);
    return Option.some(true);
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
                return DropdownUtils.makeSandbox(detail, hotspot, {
                  onOpen () { Toggling.on(hotspot); },
                  onClose () { Toggling.off(hotspot); }
                });
              }
            }
          }),
          Keying.config({
            mode: 'special',
            onSpace: triggerExecute,
            onEnter: triggerExecute,
            onDown: (comp, se) => {
              if (Dropdown.isOpen(comp)) {
                const sandbox = Coupling.getCoupled(comp, 'sandbox');
                switchToMenu(sandbox);
              } else {
                Dropdown.openAndFocus(comp);
              }

              return Option.some(true);
            },
            onEscape: (comp, se) => {
              if (Dropdown.isOpen(comp)) {
                Dropdown.close(comp);
                return Option.some(true);
              } else {
                return Option.none();
              }
            }
          }),
          Focusing.config({ })
        ]),
        SketchBehaviours.get(detail.dropdownBehaviours())
      ),

      eventOrder: Merger.deepMerge(
        detail.eventOrder(),
        {
          // Order, the button state is toggled first, so assumed !selected means close.
          'alloy.execute': [ 'toggling', 'alloy.base.behaviour' ]
        }
      ),

      apis
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

const Dropdown = Sketcher.composite({
  name: 'Dropdown',
  configFields: DropdownSchema.schema(),
  partFields: DropdownSchema.parts(),
  factory,
  apis: {
    openAndFocus: (apis, comp) => apis.openAndFocus(comp),
    open: (apis, comp) => apis.open(comp),
    close: (apis, comp) => apis.close(comp),
    isOpen: (apis, comp) => apis.isOpen(comp)
  }
}) as DropdownSketcher;

export {
  Dropdown
};