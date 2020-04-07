import { TouchEvent } from '@ephox/dom-globals';
import { Cell, Fun, Option } from '@ephox/katamari';
import { EventArgs, Focus } from '@ephox/sugar';

import * as ElementFromPoint from '../../alien/ElementFromPoint';
import { AlloyComponent } from '../../api/component/ComponentApi';
import { TransitionPropertiesSpec } from '../../behaviour/transitioning/TransitioningTypes';
import * as DropdownUtils from '../../dropdown/DropdownUtils';
import * as TouchMenuSchema from '../../ui/schema/TouchMenuSchema';
import { TouchMenuDetail, TouchMenuSketcher, TouchMenuSpec } from '../../ui/types/TouchMenuTypes';
import * as AddEventsBehaviour from '../behaviour/AddEventsBehaviour';
import * as Behaviour from '../behaviour/Behaviour';
import { Coupling } from '../behaviour/Coupling';
import { Highlighting } from '../behaviour/Highlighting';
import { Representing } from '../behaviour/Representing';
import { Sandboxing } from '../behaviour/Sandboxing';
import { Toggling } from '../behaviour/Toggling';
import { Transitioning } from '../behaviour/Transitioning';
import { Unselecting } from '../behaviour/Unselecting';
import * as SketchBehaviours from '../component/SketchBehaviours';
import * as AlloyEvents from '../events/AlloyEvents';
import * as AlloyTriggers from '../events/AlloyTriggers';
import * as NativeEvents from '../events/NativeEvents';
import * as SystemEvents from '../events/SystemEvents';
import { InlineView } from './InlineView';
import { Menu } from './Menu';
import * as Sketcher from './Sketcher';
import { CompositeSketchFactory } from './UiSketcher';

type TouchHoverState = (comp: AlloyComponent) => void;

const factory: CompositeSketchFactory<TouchMenuDetail, TouchMenuSpec> = (detail, components, spec, externals) => {

  const getMenu = (component: AlloyComponent): Option<AlloyComponent> => {
    const sandbox = Coupling.getCoupled(component, 'sandbox');
    return Sandboxing.getState(sandbox);
  };

  const hoveredState = Cell<boolean>(false);

  const hoverOn = (component: AlloyComponent): void => {
    if (!hoveredState.get()) {
      forceHoverOn(component);
    }
  };

  const forceHoverOn = (component: AlloyComponent): void => {
    detail.onHoverOn(component);
    hoveredState.set(true);
  };

  const hoverOff = (component: AlloyComponent): void => {
    if (hoveredState.get()) {
      detail.onHoverOff(component);
      hoveredState.set(false);
    }
  };

  return {
    uid: detail.uid,
    dom: detail.dom,
    components,

    domModification: {
      attributes: {
        role: detail.role.getOr('button')
      }
    },

    behaviours: SketchBehaviours.augment(
      detail.touchmenuBehaviours,
      [
        // Button showing the the touch menu is depressed
        Toggling.config({
          toggleClass: detail.toggleClass,
          aria: {
            mode: 'pressed',
            syncWithExpanded: true
          }
        }),
        Unselecting.config({ }),
        // Menu that shows up
        Coupling.config({
          others: {
            sandbox(hotspot) {
              return InlineView.sketch({
                ...externals.view(),
                lazySink: DropdownUtils.getSink(hotspot, detail),
                inlineBehaviours: Behaviour.derive([
                  AddEventsBehaviour.config('execute-for-menu', [
                    AlloyEvents.runOnExecute((c, s) => {
                      const target = s.event().target();
                      c.getSystem().getByDom(target).each((item) => {
                        detail.onExecute(hotspot, c, item, Representing.getValue(item));
                      });
                    })
                  ]),

                  // Animation
                  Transitioning.config({
                    initialState: 'closed',
                    destinationAttr: 'data-longpress-destination',
                    stateAttr: 'data-longpress-state',

                    routes: Transitioning.createBistate(
                      'open',
                      'closed',
                      detail.menuTransition.map((t) => ({
                        transition: t
                      } as TransitionPropertiesSpec)).getOr({ })
                    ),

                    onFinish(view, destination) {
                      if (destination === 'closed') {
                        InlineView.hide(view);
                        detail.onClosed(hotspot, view);
                      }
                    }
                  })

                ]),

                onShow(view: AlloyComponent) {
                  Transitioning.progressTo(view, 'open');
                }
              });
            }
          }
        })
      ]
    ),

    events: AlloyEvents.derive([

      AlloyEvents.abort(NativeEvents.contextmenu(), Fun.constant(true)),

      AlloyEvents.run(NativeEvents.touchstart(), (comp, _se) => {
        Toggling.on(comp);
      }),

      AlloyEvents.run(SystemEvents.tap(), (comp, _se) => {
        detail.onTap(comp);
      }),

      // On longpress, create the menu items to show, and put them in the sandbox.
      AlloyEvents.run(SystemEvents.longpress(), (component, _simulatedEvent) => {
        detail.fetch(component).get((items) => {
          forceHoverOn(component);
          const iMenu = Menu.sketch({
            ...externals.menu(),
            items
          });
          const sandbox = Coupling.getCoupled(component, 'sandbox');
          const anchor = detail.getAnchor(component);
          InlineView.showAt(sandbox, anchor, iMenu);
        });
      }),

      // 1. Find if touchmove over button or any items
      //   - if over items, trigger mousemover on item (and hoverOff on button)
      //   - if over button, (dehighlight all items and trigger hoverOn on button if required)
      //   - if over nothing (dehighlight all items and trigger hoverOff on button if required)
      AlloyEvents.run<EventArgs>(NativeEvents.touchmove(), (component, simulatedEvent) => {
        const raw = simulatedEvent.event().raw() as TouchEvent;
        const e = raw.touches[0];
        getMenu(component).each((iMenu) => {
          ElementFromPoint.insideComponent(iMenu, e.clientX, e.clientY).fold(() => {
            // No items, so blur everything.
            Highlighting.dehighlightAll(iMenu);

            // INVESTIGATE: Should this focus.blur be called? Should it only be called here?
            Focus.active().each(Focus.blur);

            // could not find an item, so check the button itself
            const hoverF = ElementFromPoint.insideComponent(component, e.clientX, e.clientY).fold(
              Fun.constant(hoverOff),
              Fun.constant(hoverOn)
            ) as TouchHoverState;

            hoverF(component);
          }, (elem) => {
            AlloyTriggers.dispatchWith(component, elem, NativeEvents.mouseover(), {
              x: e.clientX,
              y: e.clientY
            });
            hoverOff(component);
          });
          simulatedEvent.stop();
        });
      }),

      // 1. Trigger execute on any selected item
      // 2. Close the menu
      // 3. Depress the button
      AlloyEvents.run(NativeEvents.touchend(), (component, _simulatedEvent) => {

        getMenu(component).each((iMenu) => {
          Highlighting.getHighlighted(iMenu).each(AlloyTriggers.emitExecute);
        });

        const sandbox = Coupling.getCoupled(component, 'sandbox');
        Transitioning.progressTo(sandbox, 'closed');
        Toggling.off(component);
      }),

      AlloyEvents.runOnDetached((component, _simulatedEvent) => {
        const sandbox = Coupling.getCoupled(component, 'sandbox');
        InlineView.hide(sandbox);
      })
    ]),

    eventOrder: {
      ...detail.eventOrder,
      // Order, the button state is toggled first, so assumed !selected means close.
      [SystemEvents.execute()]: [ 'toggling', 'alloy.base.behaviour' ]
    }
  };
};

const TouchMenu: TouchMenuSketcher = Sketcher.composite({
  name: 'TouchMenu',
  configFields: TouchMenuSchema.schema(),
  partFields: TouchMenuSchema.parts(),
  factory
});

export {
  TouchMenu
};
