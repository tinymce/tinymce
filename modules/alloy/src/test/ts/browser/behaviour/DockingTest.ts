import { ApproxStructure, Assertions, Cleaner, GeneralSteps, Logger, Step, Waiter } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { window } from '@ephox/dom-globals';
import { DomEvent, Element } from '@ephox/sugar';

import * as Behaviour from 'ephox/alloy/api/behaviour/Behaviour';
import { Docking } from 'ephox/alloy/api/behaviour/Docking';
import * as GuiFactory from 'ephox/alloy/api/component/GuiFactory';
import * as SystemEvents from 'ephox/alloy/api/events/SystemEvents';
import * as GuiSetup from 'ephox/alloy/api/testhelpers/GuiSetup';
import { Container } from 'ephox/alloy/api/ui/Container';

UnitTest.asynctest('DockingTest', (success, failure) => {
  const cleanup = Cleaner();

  GuiSetup.setup((store, _doc, _body) => GuiFactory.build(
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
              right: '200px'
            }
          },
          containerBehaviours: Behaviour.derive([
            Docking.config({
              onDocked: store.adder('absolute.onDocked'),
              onUndocked: store.adder('absolute.onUndocked')
            })
          ])
        })
      ]
    })
  ), (_doc, _body, gui, component, store) => {
    const staticBox = component.components()[0];
    const absoluteBox = component.components()[1];
    cleanup.add(
      DomEvent.bind(Element.fromDom(window), 'scroll', (evt) => {
        gui.broadcastEvent(SystemEvents.windowScroll(), evt);
      }).unbind
    );
    const boxWithNoPosition = () => ApproxStructure.build((s, str, _arr) => s.element('div', {
      styles: {
        position: str.none(),
        left: str.none(),
        top: str.none(),
        right: str.none(),
        bottom: str.none()
      }
    }));

    const boxWithPosition = (position: string) => ApproxStructure.build((s, str, _arr) => s.element('div', {
      styles: {
        position: str.is(position)
      }
    }));

    const sAssertInitialStructure = Logger.t('Assert initial structure', GeneralSteps.sequence([
      Assertions.sAssertStructure(
        'Assert initial structure of staticBox. Box should have neither "position: absolute" nor "position: fixed"',
        boxWithNoPosition(),
        staticBox.element()
      ),
      Assertions.sAssertStructure(
        'Assert initial structure of absoluteBox',
        ApproxStructure.build((s, str, _arr) => s.element('div', {
          styles: {
            position: str.is('absolute'),
            left: str.none(),
            top: str.is('2300px'),
            right: str.is('200px'),
            bottom: str.none()
          }
        })),
        absoluteBox.element()
      )
    ]));

    return [
      store.sAssertEq('Store should be empty', [ ]),
      sAssertInitialStructure,

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
      // For future reference - Docking is always using 'left' and 'top' when docked but this behavior isn't set in stone
      Logger.t(
        'When fixed, absoluteBox should be positioned with "top" and "left"',
        Assertions.sAssertStructure(
          'Assert structure of absoluteBox',
          ApproxStructure.build((s, str, _arr) => s.element('div', {
            styles: {
              position: str.is('fixed'),
              left: str.contains('px'), // assert isSome
              top: str.contains('0px'),
              right: str.none(),
              bottom: str.none()
            }
          })),
          absoluteBox.element()
        ),
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
      Logger.t(
        'After undocking, the structure of the docked elements should be what it originally was',
        sAssertInitialStructure
      )
    ];
  }, cleanup.wrap(success), cleanup.wrap(failure));
});
