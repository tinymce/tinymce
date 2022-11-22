import { ApproxStructure, Assertions, Waiter } from '@ephox/agar';
import { after, before, context, describe, it } from '@ephox/bedrock-client';
import { DomEvent, EventUnbinder, SugarElement } from '@ephox/sugar';

import * as Behaviour from 'ephox/alloy/api/behaviour/Behaviour';
import { Docking } from 'ephox/alloy/api/behaviour/Docking';
import * as GuiFactory from 'ephox/alloy/api/component/GuiFactory';
import { AlloySpec } from 'ephox/alloy/api/component/SpecTypes';
import * as SystemEvents from 'ephox/alloy/api/events/SystemEvents';
import * as GuiSetup from 'ephox/alloy/api/testhelpers/GuiSetup';

describe('browser.alloy.behaviour.docking.DockingTest', () => {

  context('high-falutin', () => {

    const hook = GuiSetup.bddSetup(
      (store, _doc, _body) => {

        const staticBox: AlloySpec = {
          dom: {
            tag: 'div',
            styles: {
              width: '100px',
              height: '100px',
              background: 'blue'
            }
          },
          behaviours: Behaviour.derive([
            Docking.config({
              onDocked: store.adder('static.onDocked'),
              onUndocked: store.adder('static.onUndocked')
            })
          ])
        };

        const absoluteBox: AlloySpec = {
          dom: {
            tag: 'div',
            styles: {
              width: '100px',
              height: '100px',
              background: 'red',
              position: 'absolute',
              top: '2300px',
              right: '200px'
            }
          },
          behaviours: Behaviour.derive([
            Docking.config({
              onDocked: store.adder('absolute.onDocked'),
              onUndocked: store.adder('absolute.onUndocked')
            })
          ])
        };

        return GuiFactory.build(
          {
            dom: {
              tag: 'div',
              styles: {
                // We add these margins to allow the window page to scroll
                'margin-top': '2000px',
                'margin-bottom': '5000px'
              }
            },
            components: [
              staticBox,
              absoluteBox
            ]
          }
        );
      }
    );

    let onWindowScroll: EventUnbinder | null = null;
    before(() => {
      const gui = hook.gui();
      onWindowScroll = DomEvent.bind(SugarElement.fromDom(window), 'scroll', (evt) => {
        gui.broadcastEvent(SystemEvents.windowScroll(), evt);
      });
    });

    after(() => {
      if (onWindowScroll) {
        onWindowScroll.unbind();
      }
    });

    it('basic test', async () => {
      const store = hook.store();
      const component = hook.component();

      const staticBox = component.components()[0];
      const absoluteBox = component.components()[1];

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

      const assertInitialStructure = () => {
        Assertions.assertStructure(
          'Assert initial structure of staticBox. Box should have neither "position: absolute" nor "position: fixed"',
          boxWithNoPosition(),
          staticBox.element
        );

        Assertions.assertStructure(
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
          absoluteBox.element
        );
      };

      store.assertEq('Store should start empty', [ ]);
      assertInitialStructure();

      // Scroll the boxes completely off-screen. One of them is just at the top of the document,
      // and the other is at 2300px, so scrolling 3000px should do it.
      window.scrollTo(0, 3000);

      // Scrolling the static box off-screen should result in it being docked to the top
      await Waiter.pTryUntil(
        'Waiting until position is fixed',
        () => Assertions.assertStructure(
          'Now that static box is offscreen normally, it should switch to fixed coordinates',
          boxWithPosition('fixed'),
          staticBox.element
        )
      );

      // Scrolling the absolute box off-screen should result it in being docked to the top
      await Waiter.pTryUntil(
        'Waiting until position is fixed',
        () => Assertions.assertStructure(
          'Now that absolute box is offscreen normally, it should switch to fixed coordinates',
          ApproxStructure.build((s, str, _arr) => s.element('div', {
            styles: {
              // For future reference - Docking is always using 'left' and 'top' when docked
              // but this behavior isn't set in stone
              position: str.is('fixed'),
              left: str.contains('px'), // assert isSome
              top: str.contains('0px'),
              right: str.none(),
              bottom: str.none()
            }
          })),
          absoluteBox.element
        )
      );

      store.assertEq('When docked', [ 'static.onDocked', 'absolute.onDocked' ]);
      store.clear();

      // Now, scroll back so that the absolute box should be able to be restored to
      // its earlier position. The 2000px also allows the static box to be restored,
      // because the margin on the wrapping container is 2000px.
      window.scrollTo(0, 2000);

      // Now, the static box should no longer be docked
      await Waiter.pTryUntil(
        'Waiting until position is static',
        () => Assertions.assertStructure(
          'Now that static box is back on screen, it should switch to having no position again',
          boxWithNoPosition(),
          staticBox.element
        )
      );

      await Waiter.pTryUntil(
        'Waiting until position is absolute',
        () => Assertions.assertStructure(
          'Now that absolute box is back on screen, it should switch back to absolute',
          boxWithPosition('absolute'),
          absoluteBox.element
        )
      );

      store.assertEq('After undocked', [ 'static.onUndocked', 'absolute.onUndocked' ]);
      assertInitialStructure();
    });
  });
});
