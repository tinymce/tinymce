import { Objects } from '@ephox/boulder';
import { Cell, Fun, Merger } from '@ephox/katamari';
import { Focus } from '@ephox/sugar';

import ElementFromPoint from '../../alien/ElementFromPoint';
import * as DropdownUtils from '../../dropdown/DropdownUtils';
import * as TouchMenuSchema from '../../ui/schema/TouchMenuSchema';
import * as AddEventsBehaviour from '../behaviour/AddEventsBehaviour';
import * as Behaviour from '../behaviour/Behaviour';
import { Coupling } from '../behaviour/Coupling';
import { Highlighting } from '../behaviour/Highlighting';
import { Representing } from '../behaviour/Representing';
import Sandboxing from '../behaviour/Sandboxing';
import Toggling from '../behaviour/Toggling';
import Transitioning from '../behaviour/Transitioning';
import Unselecting from '../behaviour/Unselecting';
import SketchBehaviours from '../component/SketchBehaviours';
import * as AlloyEvents from '../events/AlloyEvents';
import * as AlloyTriggers from '../events/AlloyTriggers';
import NativeEvents from '../events/NativeEvents';
import SystemEvents from '../events/SystemEvents';
import InlineView from './InlineView';
import Menu from './Menu';
import * as Sketcher from './Sketcher';

const factory = function (detail, components, spec, externals) {

  const getMenu = function (component) {
    const sandbox = Coupling.getCoupled(component, 'sandbox');
    return Sandboxing.getState(sandbox);
  };

  const hoveredState = Cell(false);

  const hoverOn = function (component) {
    if (hoveredState.get() === false) {
      forceHoverOn(component);
    }
  };

  const forceHoverOn = function (component) {
    detail.onHoverOn()(component);
    hoveredState.set(true);
  };

  const hoverOff = function (component) {
    if (hoveredState.get() === true) {
      detail.onHoverOff()(component);
      hoveredState.set(false);
    }
  };

  return Merger.deepMerge(
    {
      uid: detail.uid(),
      dom: detail.dom(),
      components,
      behaviours: Merger.deepMerge(
        Behaviour.derive([
          // Button showing the the touch menu is depressed
          Toggling.config({
            toggleClass: detail.toggleClass(),
            aria: {
              mode: 'pressed',
              syncWithExpanded: true
            }
          }),
          Unselecting.config({ }),
          // Menu that shows up
          Coupling.config({
            others: {
              sandbox (hotspot) {

                return InlineView.sketch(
                  Merger.deepMerge(
                    externals.view(),
                    {
                      lazySink: DropdownUtils.getSink(hotspot, detail),
                      inlineBehaviours: Behaviour.derive([
                        AddEventsBehaviour.config('execute-for-menu', [
                          AlloyEvents.runOnExecute(function (c, s) {
                            const target = s.event().target();
                            c.getSystem().getByDom(target).each(function (item) {
                              detail.onExecute()(hotspot, c, item, Representing.getValue(item));
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
                            detail.menuTransition().map(function (t) {
                              return Objects.wrap('transition', t);
                            }).getOr({ })
                          ),

                          onFinish (view, destination) {
                            if (destination === 'closed') {
                              InlineView.hide(view);
                              detail.onClosed()(hotspot, view);
                            }
                          }
                        })

                      ]),

                      onShow (view) {
                        Transitioning.progressTo(view, 'open');
                      }
                    }
                  )
                );
              }
            }
          })
        ]),
        SketchBehaviours.get(detail.touchmenuBehaviours())
      ),

      events: AlloyEvents.derive([

        AlloyEvents.abort(NativeEvents.contextmenu(), Fun.constant(true)),

        AlloyEvents.run(NativeEvents.touchstart(), function (comp, se) {
          Toggling.on(comp);
        }),

        AlloyEvents.run(SystemEvents.tap(), function (comp, se) {
          detail.onTap()(comp);
        }),

        // On longpress, create the menu items to show, and put them in the sandbox.
        AlloyEvents.run(SystemEvents.longpress(), function (component, simulatedEvent) {
          detail.fetch()(component).get(function (items) {
            forceHoverOn(component);
            const iMenu = Menu.sketch(
              Merger.deepMerge(
                externals.menu(),
                {
                  items
                }
              )
            );

            const sandbox = Coupling.getCoupled(component, 'sandbox');
            const anchor = detail.getAnchor()(component);
            InlineView.showAt(sandbox, anchor, iMenu);
          });
        }),

        // 1. Find if touchmove over button or any items
        //   - if over items, trigger mousemover on item (and hoverOff on button)
        //   - if over button, (dehighlight all items and trigger hoverOn on button if required)
        //   - if over nothing (dehighlight all items and trigger hoverOff on button if required)
        AlloyEvents.run(NativeEvents.touchmove(), function (component, simulatedEvent) {
          const e = simulatedEvent.event().raw().touches[0];
          getMenu(component).each(function (iMenu) {
            ElementFromPoint.insideComponent(iMenu, e.clientX, e.clientY).fold(function () {
              // No items, so blur everything.
              Highlighting.dehighlightAll(iMenu);

              // INVESTIGATE: Should this focus.blur be called? Should it only be called here?
              Focus.active().each(Focus.blur);

              // could not find an item, so check the button itself
              const hoverF = ElementFromPoint.insideComponent(component, e.clientX, e.clientY).fold(
                Fun.constant(hoverOff),
                Fun.constant(hoverOn)
              );
              hoverF(component);
            }, function (elem) {
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
        AlloyEvents.run(NativeEvents.touchend(), function (component, simulatedEvent) {

          getMenu(component).each(function (iMenu) {
            Highlighting.getHighlighted(iMenu).each(AlloyTriggers.emitExecute);
          });

          const sandbox = Coupling.getCoupled(component, 'sandbox');
          Transitioning.progressTo(sandbox, 'closed');
          Toggling.off(component);
        }),

        AlloyEvents.runOnDetached(function (component, simulatedEvent) {
          const sandbox = Coupling.getCoupled(component, 'sandbox');
          InlineView.hide(sandbox);
        })
      ]),

      eventOrder: Merger.deepMerge(
        detail.eventOrder(),
        {
          // Order, the button state is toggled first, so assumed !selected means close.
          'alloy.execute': [ 'toggling', 'alloy.base.behaviour' ]
        }
      )
    },
    {
      dom: {
        attributes: {
          role: detail.role().getOr('button')
        }
      }
    }
  );
};

export default <any> Sketcher.composite({
  name: 'TouchMenu',
  configFields: TouchMenuSchema.schema(),
  partFields: TouchMenuSchema.parts(),
  factory
});