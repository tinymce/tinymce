import { ApproxStructure, Assertions, Cleaner, Logger, Step, Waiter } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { window } from '@ephox/dom-globals';
import { DomEvent, Element } from '@ephox/sugar';

import * as Behaviour from 'ephox/alloy/api/behaviour/Behaviour';
import { Docking } from 'ephox/alloy/api/behaviour/Docking';
import * as GuiFactory from 'ephox/alloy/api/component/GuiFactory';
import { Container } from 'ephox/alloy/api/ui/Container';
import * as GuiSetup from 'ephox/alloy/api/testhelpers/GuiSetup';
import * as SystemEvents from 'ephox/alloy/api/events/SystemEvents';

UnitTest.asynctest('DockingTest', (success, failure) => {
  const cleanup = Cleaner();

  GuiSetup.setup((store, doc, body) => {
    return GuiFactory.build(
      Container.sketch({
        dom: {
          styles: {
            'margin-top': '2000px',
            'margin-bottom': '5000px'
          }
        },
        components: [
          Container.sketch({
            dom: {
              styles: {
                width: '100px',
                height: '100px',
                background: 'blue'
              }
            },
            containerBehaviours: Behaviour.derive([
              Docking.config({
                leftAttr: 'data-dock-left',
                topAttr: 'data-dock-top',
                positionAttr: 'data-dock-pos',
                onDocked: store.adder('static.onDocked'),
                onUndocked: store.adder('static.onUndocked')
              })
            ])
          }),
          Container.sketch({
            dom: {
              styles: {
                width: '100px',
                height: '100px',
                background: 'red',
                position: 'absolute',
                top: '2300px',
                left: '200px'
              }
            },
            containerBehaviours: Behaviour.derive([
              Docking.config({
                leftAttr: 'data-dock-left',
                topAttr: 'data-dock-top',
                positionAttr: 'data-dock-pos',
                onDocked: store.adder('absolute.onDocked'),
                onUndocked: store.adder('absolute.onUndocked')
              })
            ])
          })
        ]
      })
    );

  }, (doc, body, gui, component, store) => {
    const staticBox = component.components()[0];
    const absoluteBox = component.components()[1];
    cleanup.add(
      DomEvent.bind(Element.fromDom(window), 'scroll', (evt) => {
        gui.broadcastEvent(SystemEvents.windowScroll(), evt);
      }).unbind
    );
    const boxWithNoPosition = () => {
      return ApproxStructure.build((s, str, arr) => {
        return s.element('div', {
          styles: {
            position: str.none()
          }
        });
      });
    };

    const boxWithPosition = (position) => {
      return ApproxStructure.build((s, str, arr) => {
        return s.element('div', {
          styles: {
            position: str.is(position)
          }
        });
      });
    };

    return [
      // On initial load, it should have no position.
      Assertions.sAssertStructure(
        'On initial load, static box should have neither position: absolute nor position: fixed',
        boxWithNoPosition(),
        staticBox.element()
      ),
      Assertions.sAssertStructure(
        'On initial load, absolute box should have position: absolute',
        boxWithPosition('absolute'),
        absoluteBox.element()
      ),
      store.sAssertEq('Before docking', [ ]),

      Logger.t(
        'Scroll completely offscreen',
        Step.sync(() => {
          window.scrollTo(0, 3000);
        })
      ),

      Waiter.sTryUntil(
        'Waiting until position is fixed',
        Assertions.sAssertStructure(
          'Now that static box is offscreen normally, it should switch to fixed coordinates',
          boxWithPosition('fixed'),
          staticBox.element()
        )
      ),
      Waiter.sTryUntil(
        'Waiting until position is fixed',
        Assertions.sAssertStructure(
          'Now that absolute box is offscreen normally, it should switch to fixed coordinates',
          boxWithPosition('fixed'),
          absoluteBox.element()
        )
      ),
      store.sAssertEq('When docked', [ 'static.onDocked', 'absolute.onDocked' ]),
      store.sClear,

      Logger.t(
        'Scroll back onscreen',
        Step.sync(() => {
          window.scrollTo(0, 2000);
        })
      ),

      Waiter.sTryUntil(
        'Waiting until position is static',
        Assertions.sAssertStructure(
          'Now that static box is back on screen, it should switch to having no position again',
          boxWithNoPosition(),
          staticBox.element()
        )
      ),
      Waiter.sTryUntil(
        'Waiting until position is absolute',
        Assertions.sAssertStructure(
          'Now that absolute box is back on screen, it should switch back to absolute',
          boxWithPosition('absolute'),
          absoluteBox.element()
        )
      ),
      store.sAssertEq('After undocked', [ 'static.onUndocked', 'absolute.onUndocked' ]),
    ];
  }, cleanup.wrap(success), cleanup.wrap(failure));
});
