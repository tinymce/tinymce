import { FocusTools, Keyboard, Keys, RealKeys, UiControls } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { Arr, Future, Optional, Result } from '@ephox/katamari';
import { Value } from '@ephox/sugar';

import { AlloyComponent } from 'ephox/alloy/api/component/ComponentApi';
import * as GuiFactory from 'ephox/alloy/api/component/GuiFactory';
import * as GuiSetup from 'ephox/alloy/api/testhelpers/GuiSetup';
import { Container } from 'ephox/alloy/api/ui/Container';
import { tieredMenu as TieredMenu } from 'ephox/alloy/api/ui/TieredMenu';
import { Typeahead } from 'ephox/alloy/api/ui/Typeahead';
import { TestItem } from 'ephox/alloy/test/dropdown/TestDropdownMenu';
import * as TestDropdownMenu from 'ephox/alloy/test/dropdown/TestDropdownMenu';
import * as Sinks from 'ephox/alloy/test/Sinks';
import TestTypeaheadSteps from 'ephox/alloy/test/typeahead/TestTypeaheadSteps';

UnitTest.asynctest('TypeaheadTriggerTest (webdriver)', (success, failure) => {
  GuiSetup.setup((store, _doc, _body) => {
    const sink = Sinks.relativeSink();

    return GuiFactory.build(
      Container.sketch({
        components: [
          GuiFactory.premade(sink),
          Typeahead.sketch({
            uid: 'test-type',
            inputClasses: [ 'test-typeahead' ],
            minChars: 2,

            initialData: {
              value: 'initial-value',
              meta: {
                text: 'initial-value'
              }
            },

            markers: {
              openClass: 'test-typeahead-open'
            },

            fetch: (input: AlloyComponent) => {
              const text = Value.get(input.element);
              const future = Future.pure<TestItem[]>([
                { type: 'item', data: { value: text + '1', meta: { text: text + '1' }}},
                { type: 'item', data: { value: text + '2', meta: { text: text + '2' }}}
              ]);

              return future.map((f) => {
                // TODO: Test this.
                const items: TestItem[] = text === 'no-data' ? [
                  { type: 'separator', text: 'No data' }
                ] : f;
                const menu = TestDropdownMenu.renderMenu({
                  value: 'blah',
                  items: Arr.map(items, TestDropdownMenu.renderItem)
                });
                return Optional.some(TieredMenu.singleData('blah.overall', menu));
              });
            },

            lazySink: (c) => {
              TestDropdownMenu.assertLazySinkArgs('input', 'test-typeahead', c);
              return Result.value(sink);
            },

            parts: {
              menu: TestDropdownMenu.part(store)
            }
          })
        ]
      })
    );

  }, (doc, _body, gui, _component, _store) => {

    const typeahead = gui.getByUid('test-type').getOrDie();
    const steps = TestTypeaheadSteps(doc, gui, typeahead);

    return [
      FocusTools.sSetFocus('Focusing typeahead', gui.element, 'input'),

      GuiSetup.mAddStyles(doc, [
        '.test-typeahead-selected-item { background-color: #cadbee; }'
      ]),

      steps.sAssertValue('Initial value of typeahead', 'initial-value'),
      UiControls.sSetValue(typeahead.element, 'a-'),

      // check that the typeahead is not open.
      steps.sWaitForNoMenu('Initially, there should be no menu'),

      RealKeys.sSendKeysOn(
        'input',
        [
          RealKeys.text('test-page')
        ]
      ),

      steps.sWaitForMenu('User typed into input'),

      // Focus should still be in the typeahead.
      steps.sAssertFocusOnTypeahead('Focus after menu shows up'),

      RealKeys.sSendKeysOn(
        'input',
        [
          RealKeys.backspace()
        ]
      ),

      // Focus should still be in the typeahead.
      steps.sAssertFocusOnTypeahead('Focus after backspace'),

      Keyboard.sKeydown(doc, Keys.down(), { }),
      // Focus should still be in the typeahead.
      steps.sAssertFocusOnTypeahead('Focus after <down>')
    ];
  }, success, failure);
});
