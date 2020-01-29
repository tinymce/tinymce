import { FocusTools, GeneralSteps, Keyboard, Keys, Logger, Mouse, Step, Touch, UiControls, UiFinder } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { Arr, Future, Option, Result, Strings } from '@ephox/katamari';
import { Value } from '@ephox/sugar';

import * as Behaviour from 'ephox/alloy/api/behaviour/Behaviour';
import { Focusing } from 'ephox/alloy/api/behaviour/Focusing';
import * as GuiFactory from 'ephox/alloy/api/component/GuiFactory';
import * as AlloyTriggers from 'ephox/alloy/api/events/AlloyTriggers';
import * as NativeEvents from 'ephox/alloy/api/events/NativeEvents';
import * as GuiSetup from 'ephox/alloy/api/testhelpers/GuiSetup';
import { Container } from 'ephox/alloy/api/ui/Container';
import { tieredMenu as TieredMenu } from 'ephox/alloy/api/ui/TieredMenu';
import { Typeahead } from 'ephox/alloy/api/ui/Typeahead';
import * as TestDropdownMenu from 'ephox/alloy/test/dropdown/TestDropdownMenu';
import * as Sinks from 'ephox/alloy/test/Sinks';

UnitTest.asynctest('Browser Test: .ui.typeahead.TypeaheadNoReopeningTest', (success, failure) => {

  GuiSetup.setup((store, doc, body) => {
    const sink = Sinks.relativeSink();

    return GuiFactory.build(
      Container.sketch({
        components: [
          GuiFactory.premade(sink),

          Typeahead.sketch({
            minChars: 2,
            uid: 'test-type',
            inputClasses: [ 'test-typeahead' ],
            markers: {
              // TODO: Test this
              openClass: 'test-typeahead-open'
            },

            initialData: {
              // . for value, - for text
              value: 'initial.value',
              meta: {
                text: 'initial-value'
              }
            },

            fetch (input) {
              const text = Value.get(input.element()).toLowerCase();
              const future = Future.pure([
                { type: 'item', data: { value: text + '1', meta: { text: Strings.capitalize(text) + '1' } } },
                { type: 'item', data: { value: text + '2', meta: { text: Strings.capitalize(text) + '2' } } }
              ]);

              return future.map((f) => {
                // TODO: Test this.
                const items = text === 'no-data' ? [
                  { type: 'separator', data: { value: '', meta: { text: 'No data'} } }
                ] : f;

                const menu = TestDropdownMenu.renderMenu({
                  value: 'blah',
                  items: Arr.map(items, TestDropdownMenu.renderItem)
                });
                return Option.some(TieredMenu.singleData('blah.overall', menu));
              });
            },

            lazySink (c) {
              TestDropdownMenu.assertLazySinkArgs('input', 'test-typeahead', c);
              return Result.value(sink);
            },

            parts: {
              menu: TestDropdownMenu.part(store)
            }
          })
        ],

        containerBehaviours: Behaviour.derive([
          Focusing.config({ })
        ])
      })
    );

  }, (doc, body, gui, component, store) => {

    const typeahead = gui.getByUid('test-type').getOrDie();

    const testWithChooser = (label: string, sChooser: Step<any, any>): Step<any, any> => {
      return Logger.t(
        label,
        GeneralSteps.sequence([
          Logger.t(
            'Set some content in the typeahead',
            UiControls.sSetValue(typeahead.element(), 'Neo'),
          ),

          Logger.t(
            'Trigger an "input" event and wait for the menu',
            GeneralSteps.sequence([
              Step.sync(() => {
                AlloyTriggers.emit(typeahead, NativeEvents.input());
              }),
              UiFinder.sWaitFor('Waiting for menu to appear', component.element(), '[role="menu"]')
            ])
          ),

          Logger.t(
            'Trigger another input and wait for a little bit (less than 1000s - delay)',
            GeneralSteps.sequence([
              Step.sync(() => {
                AlloyTriggers.emit(typeahead, NativeEvents.input());
              }),
              Step.wait(100)
            ])
          ),

          Logger.t(
            'While the other menu is loading, try and select an option and ensure menu goes away',
            GeneralSteps.sequence([
              sChooser,
              UiFinder.sNotExists(component.element(), '[role="menu"]')
            ])
          ),

          Logger.t(
            'Wait and ensure menu does not reappear when second input triggers',
            GeneralSteps.sequence([
              Step.wait(500),
              UiFinder.sNotExists(component.element(), '[role="menu"]')
            ])
          ),
        ])
      );
    };

    return [
      FocusTools.sSetFocus('Focusing typeahead', gui.element(), 'input'),

      GuiSetup.mAddStyles(doc, [
        '.selected-item { background-color: #cadbee; }'
      ]),

      /*
       * Steps for this test:
       *
       * 1. Type something and trigger the input event.
       * 2. Wait for the menu
       * 3. Trigger another input event
       * 4. Choose something from the menu before the next menu shows up
       * 5. Ensure that the menu doesn't flicker back open
       */
      testWithChooser(
        'Using keyboard to choose item',
        GeneralSteps.sequence([
          Keyboard.sKeydown(doc, Keys.down(), { }),
          Keyboard.sKeydown(doc, Keys.enter(), { })
        ])
      ),

      testWithChooser(
        'Using mouse to choose item',
        GeneralSteps.sequence([
          Mouse.sClickOn(component.element(), '[role="menuitem"]')
        ])
      ),

      testWithChooser(
        'Using tap to choose item',
        GeneralSteps.sequence([
          Touch.sTapOn(component.element(), '[role="menuitem"]')
        ])
      ),

      GuiSetup.mRemoveStyles
    ];
  }, () => { success(); }, failure);
});
