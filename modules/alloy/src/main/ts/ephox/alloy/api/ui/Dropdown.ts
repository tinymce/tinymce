import { Objects } from '@ephox/boulder';
import { Fun, Option } from '@ephox/katamari';

import { SugarEvent } from '../../alien/TypeDefinitions';
import { AlloyComponent } from '../../api/component/ComponentApi';
import { AlloySpec, SketchSpec } from '../../api/component/SpecTypes';
import * as AlloyTriggers from '../../api/events/AlloyTriggers';
import * as DropdownUtils from '../../dropdown/DropdownUtils';
import { SimulatedEvent } from '../../events/SimulatedEvent';
import * as ButtonBase from '../../ui/common/ButtonBase';
import * as DropdownSchema from '../../ui/schema/DropdownSchema';
import { DropdownApis, DropdownDetail, DropdownSketcher, DropdownSpec } from '../../ui/types/DropdownTypes';
import { Coupling } from '../behaviour/Coupling';
import { Focusing } from '../behaviour/Focusing';
import { Keying } from '../behaviour/Keying';
import { Sandboxing } from '../behaviour/Sandboxing';
import { Toggling } from '../behaviour/Toggling';
import * as SketchBehaviours from '../component/SketchBehaviours';
import * as SystemEvents from '../events/SystemEvents';
import * as Sketcher from './Sketcher';
import * as TieredMenu from './TieredMenu';
import { CompositeSketchFactory } from './UiSketcher';

const factory: CompositeSketchFactory<DropdownDetail, DropdownSpec> = (detail, components: AlloySpec[], _spec: DropdownSpec, externals): SketchSpec => {
  const lookupAttr = (attr: string): Option<string> => {
    return Objects.readOptFrom<Record<string, string>>(detail.dom, 'attributes').bind((attrs) => {
      return Objects.readOptFrom<string>(attrs, attr);
    });
  };

  const switchToMenu = (sandbox) => {
    Sandboxing.getState(sandbox).each((tmenu) => {
      TieredMenu.tieredMenu.highlightPrimary(tmenu);
    });
  };

  const action = (component: AlloyComponent): void => {
    const onOpenSync = switchToMenu;
    DropdownUtils.togglePopup(detail, (x) => x, component, externals, onOpenSync, DropdownUtils.HighlightOnOpen.HighlightFirst).get(Fun.noop);
  };

  const apis: DropdownApis = {
    expand: (comp) => {
      if (! Toggling.isOn(comp)) {
        DropdownUtils.togglePopup(detail, (x) => x, comp, externals, Fun.noop, DropdownUtils.HighlightOnOpen.HighlightNone).get(Fun.noop);
      }
    },
    open: (comp) => {
      if (! Toggling.isOn(comp)) {
        DropdownUtils.togglePopup(detail, (x) => x, comp, externals, Fun.noop, DropdownUtils.HighlightOnOpen.HighlightFirst).get(Fun.noop);
      }
    },
    isOpen: Toggling.isOn,
    close: (comp) => {
      if (Toggling.isOn(comp)) {
        DropdownUtils.togglePopup(detail, (x) => x, comp, externals, Fun.noop, DropdownUtils.HighlightOnOpen.HighlightFirst).get(Fun.noop);
      }
    }
  };

  const triggerExecute = (comp: AlloyComponent, se: SimulatedEvent<SugarEvent>): Option<boolean> => {
    AlloyTriggers.emitExecute(comp);
    return Option.some(true);
  };

  return {
    uid: detail.uid,
    dom: detail.dom,
    components,
    behaviours: SketchBehaviours.augment(
      detail.dropdownBehaviours,
      [
        Toggling.config({
          toggleClass: detail.toggleClass,
          aria: {
            mode: 'expanded'
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
              Dropdown.open(comp);
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
      ]
    ),

    events: ButtonBase.events(
      Option.some(action)
    ),

    eventOrder: {
      ...detail.eventOrder,
      // Order, the button state is toggled first, so assumed !selected means close.
      [SystemEvents.execute()]: [ 'disabling', 'toggling', 'alloy.base.behaviour' ]
    },

    apis,

    domModification: {
      attributes: {
        'aria-haspopup': 'true',
        ...detail.role.fold(() => ({}), (role) => ({ role })),
        ...detail.dom.tag === 'button' ? { type: lookupAttr('type').getOr('button') } : {}
      }
    }
  };
};

const Dropdown = Sketcher.composite({
  name: 'Dropdown',
  configFields: DropdownSchema.schema(),
  partFields: DropdownSchema.parts(),
  factory,
  apis: {
    open: (apis: DropdownApis, comp) => apis.open(comp),
    expand: (apis: DropdownApis, comp) => apis.expand(comp),
    close: (apis: DropdownApis, comp) => apis.close(comp),
    isOpen: (apis: DropdownApis, comp) => apis.isOpen(comp)
  }
}) as DropdownSketcher;

export {
  Dropdown
};
