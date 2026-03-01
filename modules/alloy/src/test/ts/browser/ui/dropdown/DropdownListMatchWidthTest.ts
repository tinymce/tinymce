import { Mouse, UiFinder, Waiter } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { Arr, Fun, Future, Optional, Result } from '@ephox/katamari';
import { Css, Traverse } from '@ephox/sugar';
import { assert } from 'chai';

import * as Behaviour from 'ephox/alloy/api/behaviour/Behaviour';
import { Positioning } from 'ephox/alloy/api/behaviour/Positioning';
import * as GuiFactory from 'ephox/alloy/api/component/GuiFactory';
import * as Memento from 'ephox/alloy/api/component/Memento';
import { Container } from 'ephox/alloy/api/ui/Container';
import { Dropdown } from 'ephox/alloy/api/ui/Dropdown';
import { tieredMenu as TieredMenu } from 'ephox/alloy/api/ui/TieredMenu';
import type { TestItem } from 'ephox/alloy/test/dropdown/TestDropdownMenu';
import * as TestDropdownMenu from 'ephox/alloy/test/dropdown/TestDropdownMenu';
import * as GuiSetup from 'ephox/alloy/test/GuiSetup';

const leftOffset = '440px';

describe('Dropdown Matchwidth List', () => {
  const memSink = Memento.record(
    Container.sketch({
      containerBehaviours: Behaviour.derive([
        Positioning.config({
          useFixed: Fun.always
        })
      ])
    })
  );

  const hook = GuiSetup.bddSetup((store, _doc, _body) => {
    const c = GuiFactory.build(
      Dropdown.sketch({
        dom: {
          tag: 'input',
          attributes: {
            type: 'text',
          },
          styles: {
            'width': '400px',
            'margin-left': leftOffset
          },
          classes: [ 'test-dropdown' ]
        },

        components: [
          {
            dom: {
              tag: 'span',
              innerHtml: 'hi'
            }
          }
        ],

        lazySink: (c) => {
          TestDropdownMenu.assertLazySinkArgs('input', 'test-dropdown', c);
          return Result.value(memSink.get(c));
        },
        toggleClass: 'alloy-selected',

        matchWidth: true,

        parts: {
          menu: TestDropdownMenu.part(store)
        },

        fetch: () => {
          const future = Future.pure<TestItem[]>([
            {
              type: 'item',
              data: {
                value: 'test-dropdown-wide-entry',
                meta: {
                  // eslint-disable-next-line max-len
                  text: 'A very long text to fill the area. A very long text to fill the area. A very long text to fill the area. A very long text to fill the area. A very long text to fill the area. A very long text to fill the area. A very long text to fill the area. A very long text to fill the area. A very long text to fill the area. A very long text to fill the area. A very long text to fill the area. A very long text to fill the area. A very long text to fill the area. A very long text to fill the area. A very long text to fill the area. A very long text to fill the area. A very long text to fill the area. A very long text to fill the area. A very long text to fill the area. A very long text to fill the area. A very long text to fill the area. A very long text to fill the area. A very long text to fill the area. A very long text to fill the area. A very long text to fill the area. A very long text to fill the area. A very long text to fill the area. A very long text to fill the area. A very long text to fill the area. A very long text to fill the area. A very long text to fill the area. A very long text to fill the area. A very long text to fill the area. A very long text to fill the area. A very long text to fill the area.'
                }
              }
            },
          ]);

          return future.map((f) => {
            const menu = TestDropdownMenu.renderMenu({
              value: 'v',
              items: Arr.map(f, TestDropdownMenu.renderItem)
            });
            return Optional.some(TieredMenu.singleData('test', menu));
          });
        }
      })
    );

    return c;
  });

  it('TINY-4531: The dropdown menu should be placed properly on the left side of the', async () => {
    const gui = hook.gui();
    const doc = hook.root();
    const sink = GuiFactory.build(memSink.asSpec());

    gui.add(sink);

    Mouse.clickOn(doc, 'input');

    await Waiter.pTryUntil('', () => UiFinder.exists(doc, '#test-dropdown-wide-entry'));
    const list = Traverse.parentElement(UiFinder.findIn(doc, '#test-dropdown-wide-entry').getOrDie()).getOrDie();
    assert.equal(Css.get(list, 'position'), 'fixed');
    assert.equal(Css.get(list, 'left'), leftOffset);
  });
});
