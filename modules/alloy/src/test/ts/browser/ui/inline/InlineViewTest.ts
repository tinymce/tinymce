import { ApproxStructure, Assertions, Chain, GeneralSteps, Logger, Mouse, Step, Touch, UiFinder, Waiter } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { Arr, Future, Optional, Result } from '@ephox/katamari';
import { Compare, Css, Html } from '@ephox/sugar';

import * as GuiFactory from 'ephox/alloy/api/component/GuiFactory';
import * as GuiSetup from 'ephox/alloy/api/testhelpers/GuiSetup';
import { Button } from 'ephox/alloy/api/ui/Button';
import { Container } from 'ephox/alloy/api/ui/Container';
import { Dropdown } from 'ephox/alloy/api/ui/Dropdown';
import { InlineView } from 'ephox/alloy/api/ui/InlineView';
import { tieredMenu as TieredMenu } from 'ephox/alloy/api/ui/TieredMenu';
import { TestItem } from 'ephox/alloy/test/dropdown/TestDropdownMenu';
import * as TestDropdownMenu from 'ephox/alloy/test/dropdown/TestDropdownMenu';
import * as Sinks from 'ephox/alloy/test/Sinks';
import * as TestBroadcasts from 'ephox/alloy/test/TestBroadcasts';

UnitTest.asynctest('InlineViewTest', (success, failure) => {

  GuiSetup.setup((_store, _doc, _body) => Sinks.relativeSink(), (_doc, _body, gui, component, store) => {
    const inline = GuiFactory.build(
      InlineView.sketch({
        dom: {
          tag: 'div',
          classes: [ 'test-inline' ]
        },

        lazySink: (comp) => {
          Assertions.assertEq('Checking InlineView passed through to lazySink', true, Compare.eq(inline.element, comp.element));
          return Result.value(component);
        },

        getRelated: () => {
          return Optional.some(related);
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

    const sCheckOpen = (label: string) => Logger.t(
      label,
      GeneralSteps.sequence([
        Waiter.sTryUntil(
          'Test inline should not be DOM',
          UiFinder.sExists(gui.element, '.test-inline')
        ),
        Step.sync(() => {
          Assertions.assertEq('Checking isOpen API', true, InlineView.isOpen(inline));
        })
      ])
    );

    const sCheckClosed = (label: string) => Logger.t(
      label,
      GeneralSteps.sequence([
        Waiter.sTryUntil(
          'Test inline should not be in DOM',
          UiFinder.sNotExists(gui.element, '.test-inline')
        ),
        Step.sync(() => {
          Assertions.assertEq('Checking isOpen API', false, InlineView.isOpen(inline));
        })
      ])
    );

    return [
      UiFinder.sNotExists(gui.element, '.test-inline'),

      Logger.t(
        'Check that getContent is none for an inline menu that has not shown anything',
        Step.sync(() => {
          const contents = InlineView.getContent(inline);
          Assertions.assertEq('Should be none', true, contents.isNone());
        })
      ),

      Step.sync(() => {
        InlineView.showAt(inline, Container.sketch({
          dom: {
            innerHtml: 'Inner HTML'
          }
        }), {
          anchor: {
            type: 'selection',
            root: gui.element
          }
        });
      }),
      sCheckOpen('After show'),

      Logger.t(
        'Check that getContent is some now that the inline menu has shown something',
        Step.sync(() => {
          const contents = InlineView.getContent(inline);
          Assertions.assertEq('Checking HTML of inline contents', 'Inner HTML', Html.get(contents.getOrDie(
            'Could not find contents'
          ).element));
        })
      ),

      Logger.t(
        'Change the content using setContent and check it is there',
        Step.sync(() => {
          InlineView.setContent(inline, {
            dom: {
              tag: 'div',
              innerHtml: 'changed-html'
            }
          });

          const contents = InlineView.getContent(inline);
          Assertions.assertEq('Checking HTML of inline contents has changed', 'changed-html', Html.get(contents.getOrDie(
            'Could not find contents'
          ).element));
        })
      ),

      Logger.t(
        'Check that changed content is in the DOM',
        Chain.asStep(component.element, [
          UiFinder.cFindIn('.test-inline'),
          Assertions.cAssertStructure(
            'Checking structure of changed content',
            ApproxStructure.build((s, str, arr) => s.element('div', {
              classes: [ arr.has('test-inline') ],
              children: [
                s.element('div', {
                  html: str.is('changed-html')
                })
              ]
            }))
          )
        ])
      ),

      Step.sync(() => {
        InlineView.hide(inline);
      }),

      Logger.t(
        'Check that getContent is none not that inline view has been hidden again',
        Step.sync(() => {
          const contents = InlineView.getContent(inline);
          Assertions.assertEq('Should be none', true, contents.isNone());
        })
      ),

      sCheckClosed('After hide'),

      Step.sync(() => {
        InlineView.showAt(inline, Container.sketch({
          dom: {
            innerHtml: 'Inner HTML'
          }
        }), {
          anchor: {
            type: 'makeshift',
            x: 50,
            y: 50
          }
        });
      }),
      sCheckOpen('After show'),

      Logger.t(
        'Check that inline view has a top and left',
        Chain.asStep(gui.element, [
          UiFinder.cFindIn('.test-inline'),
          Chain.op((value) => {
            Assertions.assertEq('Check view CSS top is 50px', '50px', Css.getRaw(value, 'top').getOr('no top found'));
            Assertions.assertEq('Check view CSS left is 50px', '50px', Css.getRaw(value, 'left').getOr('no left found'));
          })
        ])
      ),

      Step.sync(() => {
        InlineView.hide(inline);
      }),
      sCheckClosed('After hide'),

      Logger.t(
        'Show inline view again, this time with buttons',
        Step.sync(() => {
          const buildDropdown = (buttonText: string, optionPrefix: string) => Dropdown.sketch({
            dom: {
              tag: 'button',
              innerHtml: buttonText
            },
            components: [],

            toggleClass: 'alloy-selected',

            lazySink: () => {
              return Result.value(component);
            },
            parts: {
              menu: TestDropdownMenu.part(store)
            },
            fetch: () => {
              const future = Future.pure<TestItem[]>([
                { type: 'item', data: { value: optionPrefix.toLowerCase() + '-1', meta: { text: optionPrefix + '-1' }}},
                { type: 'item', data: { value: optionPrefix.toLowerCase() + '-2' + buttonText, meta: { text: optionPrefix + '-2' }}}
              ]);

              return future.map((f) => {
                const menu = TestDropdownMenu.renderMenu({
                  value: 'inline-view-test',
                  items: Arr.map(f, TestDropdownMenu.renderItem)
                });
                return Optional.some(TieredMenu.singleData('test', menu));
              });
            }
          });

          InlineView.showAt(inline, Container.sketch({
            components: [
              Button.sketch({ uid: 'bold-button', dom: { tag: 'button', innerHtml: 'B', classes: [ 'bold-button' ] }, action: store.adder('bold') }),
              Button.sketch({ uid: 'italic-button', dom: { tag: 'button', innerHtml: 'I', classes: [ 'italic-button' ] }, action: store.adder('italic') }),
              Button.sketch({ uid: 'underline-button', dom: { tag: 'button', innerHtml: 'U', classes: [ 'underline-button' ] }, action: store.adder('underline') }),
              buildDropdown('+', 'Option'),
              buildDropdown('-', 'Item')
            ]
          }), {
            anchor: {
              type: 'selection',
              root: gui.element
            }
          });
        })
      ),

      sCheckOpen('Should still be open with buttons and a dropdown'),

      TestBroadcasts.sDismissOn(
        'toolbar: should not close',
        gui,
        '.bold-button'
      ),

      sCheckOpen('Broadcasting dismiss on button should not close inline toolbar'),

      store.sAssertEq('Check that the store is empty initially', [ ]),
      Mouse.sClickOn(gui.element, 'button:contains("B")'),
      store.sAssertEq('Check that bold activated', [ 'bold' ]),

      store.sClear,
      store.sAssertEq('Check that the store is empty initially', [ ]),
      Touch.sTapOn(gui.element, 'button:contains("B")'),
      store.sAssertEq('Check that bold activated', [ 'bold' ]),

      // TODO: Make it not close if the inline toolbar had a dropdown, and the dropdown
      // item was selected. Requires composition of "isPartOf"
      Logger.t(
        'Check that clicking on a dropdown item in the inline toolbar does not dismiss popup',
        GeneralSteps.sequence([
          // Click on the dropdown
          Mouse.sClickOn(gui.element, 'button:contains(+)'),
          // Wait until dropdown loads.
          Waiter.sTryUntil(
            'Waiting for dropdown list to appear',
            UiFinder.sExists(gui.element, 'li:contains("Option-1")')
          ),
          TestBroadcasts.sDismissOn(
            'dropdown item: should not close',
            gui,
            'li:contains("Option-2")'
          ),
          sCheckOpen('Broadcasting dismiss on a dropdown item should not close inline toolbar')
        ])
      ),

      Logger.t(
        'Check that tapping on a dropdown item in the inline toolbar does not dismiss popup',
        GeneralSteps.sequence([
          // Tap on the dropdown
          Touch.sTapOn(gui.element, 'button:contains(-)'),
          // Wait until dropdown loads.
          Waiter.sTryUntil(
            'Waiting for dropdown list to appear',
            UiFinder.sExists(gui.element, 'li:contains("Item-1")')
          ),
          TestBroadcasts.sDismissOn(
            'dropdown item: should not close',
            gui,
            'li:contains("Item-2")'
          ),
          sCheckOpen('Broadcasting dismiss on a dropdown item should not close inline toolbar')
        ])
      ),

      TestBroadcasts.sDismiss(
        'related element: should not close',
        gui,
        related.element
      ),
      sCheckOpen('The inline view should not have closed when broadcasting on related'),

      TestBroadcasts.sDismiss(
        'outer gui element: should close',
        gui,
        gui.element
      ),

      sCheckClosed('Broadcasting dismiss on a external element should close inline toolbar')

    ];
  }, success, failure);
});
