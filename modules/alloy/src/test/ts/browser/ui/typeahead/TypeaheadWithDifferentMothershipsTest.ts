
import { ApproxStructure, Assertions, Keyboard, Keys, Mouse, TestStore, UiControls, UiFinder } from '@ephox/agar';
import { after, before, context, describe, it } from '@ephox/bedrock-client';
import { Objects } from '@ephox/boulder';
import { Arr, Future, Optional, Result } from '@ephox/katamari';
import { SugarDocument, Value } from '@ephox/sugar';

import { Focusing } from 'ephox/alloy/api/behaviour/Focusing';
import { AlloyComponent } from 'ephox/alloy/api/component/ComponentApi';
import * as GuiFactory from 'ephox/alloy/api/component/GuiFactory';
import { SketchSpec } from 'ephox/alloy/api/component/SpecTypes';
import * as AlloyTriggers from 'ephox/alloy/api/events/AlloyTriggers';
import * as NativeEvents from 'ephox/alloy/api/events/NativeEvents';
import * as Attachment from 'ephox/alloy/api/system/Attachment';
import * as Gui from 'ephox/alloy/api/system/Gui';
import * as GuiSetup from 'ephox/alloy/api/testhelpers/GuiSetup';
import { tieredMenu as TieredMenu } from 'ephox/alloy/api/ui/TieredMenu';
import { Typeahead } from 'ephox/alloy/api/ui/Typeahead';
import * as MenuEvents from 'ephox/alloy/menu/util/MenuEvents';
import * as TestDropdownMenu from 'ephox/alloy/test/dropdown/TestDropdownMenu';
import { TestItem } from 'ephox/alloy/test/dropdown/TestDropdownMenu';
import * as Sinks from 'ephox/alloy/test/Sinks';

describe('browser.alloy.ui.typeahead.TypeaheadWithDifferentMothershipsTest', () => {
  // This test checks that all of Typeahead's functions work when the sink is in a
  // different mothership.
  const makeTypeahead = (store: TestStore, sinkFromOtherMothership: AlloyComponent): SketchSpec => {
    return Typeahead.sketch({
      inputClasses: [ 'test-typeahead' ],
      components: [ ],

      minChars: 2,
      model: {
      // Enabling populateFromBrowse and selectsOver makes it easier to check it is
      // all wired together properly.
        selectsOver: false,
        populateFromBrowse: true
      },
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
        return Result.value(sinkFromOtherMothership);
      },

      parts: {
        menu: TestDropdownMenu.part(store)
      },

      markers: {
        openClass: 'typeahead-open-for-business'
      }
    });
  };

  GuiSetup.bddAddStyles(SugarDocument.getDocument(), [
    `.selected-item {
      background-color: #cadbee;
    }`
  ]);

  const otherMothership = Gui.create();
  const sink = Sinks.relativeSink();
  otherMothership.add(sink);

  const hook = GuiSetup.bddSetup(
    (store) => GuiFactory.build(makeTypeahead(store, sink))
  );

  before(() => {
    Attachment.attachSystem(hook.body(), otherMothership);
  });

  after(() => {
    Attachment.detachSystem(otherMothership);
  });

  context('Testing interactions between different motherships', () => {
    it('TINY-8952: Testing hovering on items should populate input field', async () => {
      const typeaheadComp = hook.component();
      Focusing.focus(typeaheadComp);

      UiControls.setValue(typeaheadComp.element, 'Item');
      AlloyTriggers.emit(typeaheadComp, NativeEvents.input());
      const menu = await UiFinder.pWaitForVisible(
        'Waiting for menu to appear',
        otherMothership.element,
        '.menu'
      );
      Assertions.assertStructure(
        'Checking menu triggered by input has no selection (previewing)', ApproxStructure.build((s) => {
          return s.element('ol', {
            children: TestDropdownMenu.itemsHaveActiveStates([ false, false, false ])
          });
        }),
        menu
      );
      const firstItem = UiFinder.findIn(menu, '[data-value=item-0-value]').getOrDie();
      Mouse.mouseOver(firstItem);
      const inputText = UiControls.getValue(typeaheadComp.element);
      Assertions.assertEq(
        'Input should have been updated by hover because populateFromBrowse is ON',
        'Item-0-text',
        inputText
      );
    });

    it('TINY-8952: Testing clicking on items should populate input field and close menu', async () => {
      // Trigger the dropdown on the typeahead.
      const typeaheadComp = hook.component();
      Focusing.focus(typeaheadComp);
      UiControls.setValue(typeaheadComp.element, 'Item');
      Keyboard.activeKeydown(hook.root(), Keys.down(), { });
      await UiFinder.pWaitForVisible(
        'Waiting for menu to appear',
        otherMothership.element,
        '.menu'
      );
      Mouse.clickOn(sink.element, '[data-value=item-1-value]');
      const inputText = UiControls.getValue(typeaheadComp.element);
      Assertions.assertEq(
        'Input should have been updated by click',
        'Item-1-text',
        inputText
      );
      // And it should have closed the menu.
      UiFinder.notExists(sink.element, '.menu');
    });

    it('TINY-8952: Testing navigating via keyboard to items should populate input field', async () => {
      // Trigger the dropdown on the typeahead.
      const typeaheadComp = hook.component();
      Focusing.focus(typeaheadComp);
      UiControls.setValue(typeaheadComp.element, 'Item');
      Keyboard.activeKeydown(hook.root(), Keys.down(), { });
      await UiFinder.pWaitForVisible(
        'Waiting for menu to appear',
        otherMothership.element,
        '.menu'
      );

      Keyboard.activeKeydown(hook.root(), Keys.down(), { });
      Keyboard.activeKeydown(hook.root(), Keys.down(), { });
      const menu = await UiFinder.pWaitForVisible(
        'Waiting for menu to appear',
        otherMothership.element,
        '.menu'
      );
      Assertions.assertStructure(
        'Checking menu navigated by <down> arrow has highlighed last item',
        ApproxStructure.build((s) => {
          return s.element('ol', {
            children: TestDropdownMenu.itemsHaveActiveStates([ false, false, true ])
          });
        }),
        menu
      );

      const inputText = UiControls.getValue(typeaheadComp.element);
      Assertions.assertEq(
        'Input should have been updated by navigation',
        'Item-2-text',
        inputText
      );
    });
  });
});
