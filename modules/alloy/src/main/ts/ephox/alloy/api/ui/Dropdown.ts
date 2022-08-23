import { Fun, Future, Obj, Optional } from '@ephox/katamari';
import { EventArgs } from '@ephox/sugar';

import * as DropdownUtils from '../../dropdown/DropdownUtils';
import { SimulatedEvent } from '../../events/SimulatedEvent';
import * as ButtonBase from '../../ui/common/ButtonBase';
import * as DropdownSchema from '../../ui/schema/DropdownSchema';
import { DropdownApis, DropdownDetail, DropdownSketcher, DropdownSpec } from '../../ui/types/DropdownTypes';
import { HighlightOnOpen } from '../../ui/types/TieredMenuTypes';
import { Coupling } from '../behaviour/Coupling';
import { Focusing } from '../behaviour/Focusing';
import { Keying } from '../behaviour/Keying';
import { Sandboxing } from '../behaviour/Sandboxing';
import { Toggling } from '../behaviour/Toggling';
import { AlloyComponent } from '../component/ComponentApi';
import * as SketchBehaviours from '../component/SketchBehaviours';
import { AlloySpec, SketchSpec } from '../component/SpecTypes';
import * as AlloyTriggers from '../events/AlloyTriggers';
import * as SystemEvents from '../events/SystemEvents';
import * as Sketcher from './Sketcher';
import * as TieredMenu from './TieredMenu';
import { CompositeSketchFactory } from './UiSketcher';

const factory: CompositeSketchFactory<DropdownDetail, DropdownSpec> = (detail, components: AlloySpec[], _spec: DropdownSpec, externals): SketchSpec => {
  const lookupAttr = (attr: string) => Obj.get(detail.dom, 'attributes').bind((attrs) => Obj.get(attrs, attr));

  const switchToMenu = (sandbox: AlloyComponent) => {
    Sandboxing.getState(sandbox).each((tmenu) => {
      // This will highlight the menu AND the item
      TieredMenu.tieredMenu.highlightPrimary(tmenu);
    });
  };

  const togglePopup = (dropdownComp: AlloyComponent, onOpenSync: (c: AlloyComponent) => void, highlightOnOpen: HighlightOnOpen): Future<AlloyComponent> => {
    return DropdownUtils.togglePopup(
      detail,
      Fun.identity,
      dropdownComp,
      externals,
      onOpenSync,
      highlightOnOpen
    );
  };

  const action = (component: AlloyComponent): void => {
    const onOpenSync = switchToMenu;
    togglePopup(component, onOpenSync, HighlightOnOpen.HighlightMenuAndItem).get(Fun.noop);
  };

  const apis: DropdownApis = {
    expand: (comp) => {
      if (!Toggling.isOn(comp)) {
        togglePopup(comp, Fun.noop, HighlightOnOpen.HighlightNone).get(Fun.noop);
      }
    },
    open: (comp) => {
      if (!Toggling.isOn(comp)) {
        togglePopup(comp, Fun.noop, HighlightOnOpen.HighlightMenuAndItem).get(Fun.noop);
      }
    },
    refetch: (comp) => {
      // Generally, the triggers for a refetch should make it so that the
      // sandbox has been created, but it's not guaranteed, so we still handle the
      // case where there isn't yet a sandbox.
      const optSandbox = Coupling.getExistingCoupled(comp, 'sandbox');
      return optSandbox.fold(
        () => {
          // If we don't have a sandbox, refetch is the same as open,
          // except we return when it is completed.
          return togglePopup(comp, Fun.noop, HighlightOnOpen.HighlightMenuAndItem)
            .map(Fun.noop);
        },
        (sandboxComp) => {
          // We are intentionally not preserving the selected items when
          // triggering a refetch, and will just highlight the first item.
          // Note: this will mean that submenus will close. If we want to start
          // preserving the selected items, we can't rely on the components themselves,
          // so we'd need to use the item and menu values through Representing.
          // However, be aware that alloy menus and items often have randomised values,
          // so these might not be reliable either.

          // NOTE: We use DropdownUtils.open directly, because we want it to 'open',
          // even if it's already open. If we just used apis.open, it wouldn't do
          // anything if it was already open, which means we wouldn't see the new
          // refetched data.
          return DropdownUtils.open(
            detail,
            Fun.identity,
            comp,
            // NOTE: The TieredMenu is inside the sandbox. They aren't the same component.
            sandboxComp,
            externals,
            Fun.noop,
            HighlightOnOpen.HighlightMenuAndItem
          ).map(
            Fun.noop
          );
        }
      );
    },
    isOpen: Toggling.isOn,
    close: (comp) => {
      if (Toggling.isOn(comp)) {
        togglePopup(comp, Fun.noop, HighlightOnOpen.HighlightMenuAndItem).get(Fun.noop);
      }
    },
    // If we are open, refresh the menus in the tiered menu system
    repositionMenus: (comp) => {
      if (Toggling.isOn(comp)) {
        DropdownUtils.repositionMenus(comp);
      }
    }
  };

  const triggerExecute = (comp: AlloyComponent, _se: SimulatedEvent<EventArgs>): Optional<boolean> => {
    AlloyTriggers.emitExecute(comp);
    return Optional.some<boolean>(true);
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
            sandbox: (hotspot) => {
              return DropdownUtils.makeSandbox(detail, hotspot, {
                onOpen: () => Toggling.on(hotspot),
                onClose: () => Toggling.off(hotspot)
              });
            }
          }
        }),
        Keying.config({
          mode: 'special',
          onSpace: triggerExecute,
          onEnter: triggerExecute,
          onDown: (comp, _se): Optional<boolean> => {
            if (Dropdown.isOpen(comp)) {
              const sandbox = Coupling.getCoupled(comp, 'sandbox');
              switchToMenu(sandbox);
            } else {
              Dropdown.open(comp);
            }

            return Optional.some<boolean>(true);
          },
          onEscape: (comp, _se): Optional<boolean> => {
            if (Dropdown.isOpen(comp)) {
              Dropdown.close(comp);
              return Optional.some<boolean>(true);
            } else {
              return Optional.none();
            }
          }
        }),
        Focusing.config({ })
      ]
    ),

    events: ButtonBase.events(
      Optional.some(action)
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

const Dropdown: DropdownSketcher = Sketcher.composite<DropdownSpec, DropdownDetail, DropdownApis>({
  name: 'Dropdown',
  configFields: DropdownSchema.schema(),
  partFields: DropdownSchema.parts(),
  factory,
  apis: {
    open: (apis, comp) => apis.open(comp),
    refetch: (apis, comp) => apis.refetch(comp),
    expand: (apis, comp) => apis.expand(comp),
    close: (apis, comp) => apis.close(comp),
    isOpen: (apis, comp) => apis.isOpen(comp),
    repositionMenus: (apis, comp) => apis.repositionMenus(comp)
  }
});

export {
  Dropdown
};
