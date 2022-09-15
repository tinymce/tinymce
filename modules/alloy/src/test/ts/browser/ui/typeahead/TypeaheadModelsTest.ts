import { ApproxStructure, Assertions, Keyboard, Keys, TestStore, UiFinder } from '@ephox/agar';
import { context, describe, it } from '@ephox/bedrock-client';
import { Objects } from '@ephox/boulder';
import { Arr, Future, Optional, Result } from '@ephox/katamari';
import { SelectorFind, SugarDocument, SugarElement, Value } from '@ephox/sugar';

import { Focusing } from 'ephox/alloy/api/behaviour/Focusing';
import { AlloyComponent } from 'ephox/alloy/api/component/ComponentApi';
import * as GuiFactory from 'ephox/alloy/api/component/GuiFactory';
import { SketchSpec } from 'ephox/alloy/api/component/SpecTypes';
import * as AlloyTriggers from 'ephox/alloy/api/events/AlloyTriggers';
import * as NativeEvents from 'ephox/alloy/api/events/NativeEvents';
import * as GuiSetup from 'ephox/alloy/api/testhelpers/GuiSetup';
import { tieredMenu as TieredMenu } from 'ephox/alloy/api/ui/TieredMenu';
import { Typeahead } from 'ephox/alloy/api/ui/Typeahead';
import * as MenuEvents from 'ephox/alloy/menu/util/MenuEvents';
import * as TestDropdownMenu from 'ephox/alloy/test/dropdown/TestDropdownMenu';
import { TestItem } from 'ephox/alloy/test/dropdown/TestDropdownMenu';
import * as Sinks from 'ephox/alloy/test/Sinks';
import { TypeaheadSpec } from 'ephox/alloy/ui/types/TypeaheadTypes';

describe('browser.alloy.ui.typeahead.TypeaheadModelsTest', () => {
  GuiSetup.bddAddStyles(SugarDocument.getDocument(), [
    `.selected-item {
      background-color: #cadbee;
    }`
  ]);

  const makeTypeahead = (store: TestStore, sink: AlloyComponent, model: TypeaheadSpec['model']): SketchSpec => {
    return Typeahead.sketch({
      inputClasses: [ 'test-typeahead' ],
      components: [ ],

      minChars: 2,
      model,
      fetch: (input) => {
        const text = Value.get(input.element).toLowerCase();

        const items = Arr.range(3, (i): TestItem => {
          return {
            type: 'item',
            data: {
              value: `item-${i}-value`,
              meta: {
                text: `Item-${i}-text`
              }
            }
          };
        });

        const future = Future.pure<TestItem[]>(items);

        return future.map((f) => {
          const items: TestItem[] = text === 'no-data' ? [
            { type: 'separator', text: 'No data' }
          ] : f;

          const menu = TestDropdownMenu.renderMenu({
            value: 'test-menu-value',
            items: Arr.map(items, TestDropdownMenu.renderItem)
          });
          return Optional.some(TieredMenu.singleData('tiered-test-menu-name', menu));
        });
      },

      initialData: {
        // . for value, - for text
        value: 'initial.value',
        meta: {
          text: 'initial-value'
        }
      },

      eventOrder: Objects.wrapAll([
        {
          key: MenuEvents.focus(),
          value: [ 'alloy.base.behaviour', 'tiered-menu-test' ]
        }
      ]),

      lazySink: (c) => {
        TestDropdownMenu.assertLazySinkArgs('input', 'test-typeahead', c);
        return Result.value(sink);
      },

      parts: {
        menu: TestDropdownMenu.part(store)
      },

      markers: {
        openClass: 'typeahead-open-for-business'
      }
    });
  };

  const makeTypeaheadContainer = (store: TestStore, sink: AlloyComponent, model: TypeaheadSpec['model']): AlloyComponent => {
    return GuiFactory.build({
      dom: {
        tag: 'div',
        classes: [ 'overall-test-container' ]
      },
      components: [
        GuiFactory.premade(sink),
        makeTypeahead(store, sink, model)
      ]
    });
  };

  const assertInputState = (label: string, expected: { text: string; selStart: number; selEnd: number }, typeaheadComp: AlloyComponent) => {
    const raw = typeaheadComp.element.dom as HTMLInputElement;
    Assertions.assertEq(
      `Check input value (${label})`,
      expected.text,
      Value.get(typeaheadComp.element)
    );

    Assertions.assertEq(
      `Check input selection range (${label})`,
      {
        start: expected.selStart,
        end: expected.selEnd
      },
      {
        start: raw.selectionStart,
        end: raw.selectionEnd,
      }
    );
  };

  const setAndEmit = (typeahead: AlloyComponent, val: string) => {
    Value.set(typeahead.element, val);
    Focusing.focus(typeahead);
    AlloyTriggers.emit(typeahead, NativeEvents.input());
  };

  const getTypeaheadOrDie = (container: AlloyComponent): AlloyComponent => {
    return container.getSystem().getByDom(
      SelectorFind.descendant(container.element, '.test-typeahead').getOrDie(
        'Could not find typeahead'
      )
    ).getOrDie();
  };

  const pWaitForMenu = (body: SugarElement) => UiFinder.pWaitFor(
    'Waiting for menu',
    body,
    '.menu'
  );

  const assertCursorAtEndOf = (label: string, text: string, typeaheadComp: AlloyComponent) => {
    assertInputState(
      `Cursor should be at the end of ${text} [${label}]`,
      {
        text,
        selStart: text.length,
        selEnd: text.length
      },
      typeaheadComp
    );
  };

  const assertSelectedOver = (label: string, text: string, excess: string, typeaheadComp: AlloyComponent) => {
    assertInputState(
      `Entire word should be ${text}${excess}, with ${excess} 'selectedOver' [${label}]`,
      {
        text: text + excess,
        selStart: text.length,
        selEnd: text.length + excess.length
      },
      typeaheadComp
    );
  };

  const assertMenuStructWithItemStates = (label: string, activeItemStates: boolean[], menuElement: SugarElement<Node>) => Assertions.assertStructure(
    `Assert menu structure ${label}`,
    ApproxStructure.build((s) => {
      return s.element('ol', {
        children: TestDropdownMenu.itemsHaveActiveStates(activeItemStates)
      });
    }),
    menuElement
  );

  context('selectsOver = false', () => {
    const selectsOver = false;
    context('populatedFromBrowse = false', () => {
      const sink = Sinks.relativeSink();
      const hook = GuiSetup.bddSetup(
        (store) => makeTypeaheadContainer(store, sink, {
          populateFromBrowse: false,
          selectsOver
        })
      );

      it('TINY-8952: Basic test', async () => {
        const container = hook.component();
        const typeahead = getTypeaheadOrDie(container);

        // This combination of settings should mean that we don't have highlight
        // after expanding (even if items match) - so we stay in previewing
        setAndEmit(typeahead, 'Item');

        // Now we can wait for the menu to appear.
        const menuElement = await pWaitForMenu(hook.body());
        // In this mode, selectsOver = false and populateFromBrowse = false,
        // there should be no selection at all, and the input should be unchanged.
        assertMenuStructWithItemStates(
          'No selection, because in previewing mode and not using selectsOver',
          [ false, false, false ],
          menuElement
        );
        assertCursorAtEndOf('unchanged', 'Item', typeahead);

        // When pressing down, there should now be a selection, but the input should
        // not change (due to populateFromBrowse = false)
        Keyboard.activeKeydown(hook.root(), Keys.down(), {});
        assertMenuStructWithItemStates(
          'Pressing <down> should exit previewing and highlight first item',
          [ true, false, false ],
          menuElement
        );
        assertCursorAtEndOf('unchanged', 'Item', typeahead);
      });
    });

    context('populatedFromBrowse = true', () => {
      const sink = Sinks.relativeSink();
      const hook = GuiSetup.bddSetup(
        (store) => makeTypeaheadContainer(store, sink, {
          populateFromBrowse: true,
          selectsOver
        })
      );

      it('TINY-8952: Basic test', async () => {
        const container = hook.component();
        const typeahead = getTypeaheadOrDie(container);

        // This combination of settings should mean that we don't have highlight
        // after expanding (even if items match) - so we stay in previewing
        setAndEmit(typeahead, 'Item');

        // Now we can wait for the menu to appear.
        const menuElement = await pWaitForMenu(hook.body());

        // In this mode, selectsOver = false and populateFromBrowse = false,
        // there should be no selection at all, and the input should be unchanged.
        assertMenuStructWithItemStates(
          'No selection, because in previewing mode and not using selectsOver',
          [ false, false, false ],
          menuElement
        );
        assertCursorAtEndOf('unchanged', 'Item', typeahead);

        // When pressing down, there should now be a selection, and the input should change
        Keyboard.activeKeydown(hook.root(), Keys.down(), {});
        assertMenuStructWithItemStates(
          'Pressing <down> should exit previewing and highlight first item',
          [ true, false, false ],
          menuElement
        );
        assertCursorAtEndOf('populated-by-browsing', 'Item-0-text', typeahead);
      });
    });
  });

  context('selectsOver = true', () => {
    const selectsOver = true;
    context('populatedFromBrowse = false', () => {
      const sink = Sinks.relativeSink();
      const hook = GuiSetup.bddSetup(
        (store) => makeTypeaheadContainer(store, sink, {
          populateFromBrowse: false,
          selectsOver
        })
      );

      it('TINY-8952: Basic test', async () => {
        const container = hook.component();
        const typeahead = getTypeaheadOrDie(container);

        // "Type" something that is a prefix of the highlighted item.
        setAndEmit(typeahead, 'Item');

        // Now we can wait for the menu to appear.
        const menuElement = await pWaitForMenu(hook.body());

        // selectsOver is true, so we should have highlighted the first one,
        // and we change our value to match, but with a text selection.
        assertMenuStructWithItemStates(
          'successful selectsOver should have highlighted the first one',
          [ true, false, false ],
          menuElement
        );
        assertSelectedOver('selectsOver while previewing', 'Item', '-0-text', typeahead);

        // When pressing down, we aren't previewing any more, so because
        // populateFromBrowse is false, we keep our old value of item-0-text
        // with the same text selection, but navigate to item-1-text.
        // It's probably an unusual combination to
        // have: selectsOver=true + populateFromBrowse=false
        Keyboard.activeKeydown(hook.root(), Keys.down(), {});
        assertMenuStructWithItemStates(
          'Pressing <down> should navigate to second item',
          [ false, true, false ],
          menuElement
        );
        assertSelectedOver(
          'value preserved because no populatingFromBrowse',
          'Item',
          '-0-text',
          typeahead
        );
      });
    });

    context('populatedFromBrowse = true', () => {
      const sink = Sinks.relativeSink();
      const hook = GuiSetup.bddSetup(
        (store) => makeTypeaheadContainer(store, sink, {
          populateFromBrowse: true,
          selectsOver
        })
      );

      it('TINY-8952: Basic test', async () => {
        const container = hook.component();
        const typeahead = getTypeaheadOrDie(container);

        setAndEmit(typeahead, 'Item');

        // Now we can wait for the menu to appear.
        const menuElement = await pWaitForMenu(hook.root());

        // selectsOver is true, so we should have highlighted the first one,
        // and we change our value to match, but with a text selection.
        assertMenuStructWithItemStates(
          'successful selectsOver should have highlighted the first one',
          [ true, false, false ],
          menuElement
        );
        assertSelectedOver('selectsOver while previewing', 'Item', '-0-text', typeahead);

        // In this mode, selectsOver = true and populateFromBrowse = true, so navigating
        // to the next item will use populateFromBrowser=true to change the value input.
        Keyboard.activeKeydown(hook.root(), Keys.down(), {});
        assertMenuStructWithItemStates(
          'Pressing <down> should navigate to second item',
          [ false, true, false ],
          menuElement
        );
        assertCursorAtEndOf(
          'value CHANGED because of populatingFromBrowse',
          'Item-1-text',
          typeahead
        );
      });
    });
  });
});
