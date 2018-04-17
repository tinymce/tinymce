import { Assertions, GeneralSteps, Logger, Mouse, Step, UiFinder, Waiter } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { Arr, Future, Option, Result } from '@ephox/katamari';
import * as GuiFactory from 'ephox/alloy/api/component/GuiFactory';
import { Button } from 'ephox/alloy/api/ui/Button';
import { Container } from 'ephox/alloy/api/ui/Container';
import { Dropdown } from 'ephox/alloy/api/ui/Dropdown';
import { InlineView } from 'ephox/alloy/api/ui/InlineView';
import * as TieredMenu from 'ephox/alloy/api/ui/TieredMenu';
import TestDropdownMenu from 'ephox/alloy/test/dropdown/TestDropdownMenu';
import * as GuiSetup from 'ephox/alloy/test/GuiSetup';
import Sinks from 'ephox/alloy/test/Sinks';
import TestBroadcasts from 'ephox/alloy/test/TestBroadcasts';

UnitTest.asynctest('InlineViewTest', function () {
  const success = arguments[arguments.length - 2];
  const failure = arguments[arguments.length - 1];

  GuiSetup.setup(function (store, doc, body) {
    return Sinks.relativeSink();

  }, function (doc, body, gui, component, store) {
    const inline = GuiFactory.build(
      InlineView.sketch({
        dom: {
          tag: 'div',
          classes: [ 'test-inline' ]
        },

        lazySink () {
          return Result.value(component);
        },

        getRelated () {
          return Option.some(related);
        }
        // onEscape: store.adderH('inline.escape')
      })
    );

    const related = GuiFactory.build({
      dom: {
        tag: 'div',
        classes: [ 'related-to-inline' ],
        styles: {
          background: 'blue',
          width: '50px',
          height: '50px'
        }
      }
    });

    gui.add(related);

    const sCheckOpen = function (label) {
      return Logger.t(
        label,
        GeneralSteps.sequence([
          Waiter.sTryUntil(
            'Test inline should not be DOM',
            UiFinder.sExists(gui.element(), '.test-inline'),
            100,
            1000
          ),
          Step.sync(function () {
            Assertions.assertEq('Checking isOpen API', true, InlineView.isOpen(inline));
          })
        ])
      );
    };

    const sCheckClosed = function (label) {
      return Logger.t(
        label,
        GeneralSteps.sequence([
          Waiter.sTryUntil(
            'Test inline should not be in DOM',
            UiFinder.sNotExists(gui.element(), '.test-inline'),
            100,
            1000
          ),
          Step.sync(function () {
            Assertions.assertEq('Checking isOpen API', false, InlineView.isOpen(inline));
          })
        ])
      );
    };

    return [
      UiFinder.sNotExists(gui.element(), '.test-inline'),
      Step.sync(function () {
        InlineView.showAt(inline, {
          anchor: 'selection',
          root: gui.element()
        }, Container.sketch({
          dom: {
            innerHtml: 'Inner HTML'
          }
        }));
      }),
      sCheckOpen('After show'),

      Step.sync(function () {
        InlineView.hide(inline);
      }),

      sCheckClosed('After hide'),

      Logger.t(
        'Show inline view again, this time with buttons',
        Step.sync(function () {
          InlineView.showAt(inline, {
            anchor: 'selection',
            root: gui.element()
          }, Container.sketch({
            components: [
              Button.sketch({ uid: 'bold-button', dom: { tag: 'button', innerHtml: 'B' }, action: store.adder('bold') }),
              Button.sketch({ uid: 'italic-button', dom: { tag: 'button', innerHtml: 'I' }, action: store.adder('italic') }),
              Button.sketch({ uid: 'underline-button', dom: { tag: 'button', innerHtml: 'U' }, action: store.adder('underline') }),
              Dropdown.sketch({
                dom: {
                  tag: 'button',
                  innerHtml: '+'
                },
                components: [ ],

                toggleClass: 'alloy-selected',

                lazySink () { return Result.value(component); },
                parts: {
                  menu: TestDropdownMenu.part(store)
                },
                fetch () {
                  const future = Future.pure([
                    { type: 'item', data: { value: 'option-1', text: 'Option-1' } },
                    { type: 'item', data: { value: 'option-2', text: 'Option-2' } }
                  ]);

                  return future.map(function (f) {
                    const menu = TestDropdownMenu.renderMenu({
                      value: 'inline-view-test',
                      items: Arr.map(f, TestDropdownMenu.renderItem)
                    });
                    return TieredMenu.tieredMenuSketch.singleData('test', menu);
                  });
                }
              })
            ]
          }));
        })
      ),

      sCheckOpen('Should still be open with buttons and a dropdown'),

      TestBroadcasts.sDismissOn(
        'toolbar: should not close',
        gui,
        '[data-alloy-id="bold-button"]'
      ),

      sCheckOpen('Broadcasting dismiss on button should not close inline toolbar'),

      store.sAssertEq('Check that the store is empty initially', [ ]),
      Mouse.sClickOn(gui.element(), 'button:contains("B")'),
      store.sAssertEq('Check that bold activated', [ 'bold' ]),

      // TODO: Make it not close if the inline toolbar had a dropdown, and the dropdown
      // item was selected. Requires composition of "isPartOf"
      Logger.t(
        'Check that clicking on a dropdown item in the inline toolbar does not dismiss popup',
        GeneralSteps.sequence([
          // Click on the dropdown
          Mouse.sClickOn(gui.element(), 'button:contains(+)'),
          // Wait until dropdown loads.
          Waiter.sTryUntil(
            'Waiting for dropdown list to appear',
            UiFinder.sExists(gui.element(), 'li:contains("Option-1")'),
            100, 1000
          ),
          TestBroadcasts.sDismissOn(
            'dropdown item: should not close',
            gui,
            'li:contains("Option-2")'
          ),
          sCheckOpen('Broadcasting dismiss on a dropdown item should not close inline toolbar')
        ])
      ),

      TestBroadcasts.sDismiss(
        'related element: should not close',
        gui,
        related.element()
      ),
      sCheckOpen('The inline view should not have closed when broadcasting on related'),

      TestBroadcasts.sDismiss(
        'outer gui element: should close',
        gui,
        gui.element()
      ),

      sCheckClosed('Broadcasting dismiss on a external element should close inline toolbar')

    ];
  }, function () { success(); }, failure);
});
