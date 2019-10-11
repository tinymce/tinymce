import { FocusTools, Keyboard, Keys, Step, Assertions, Logger, Chain, GeneralSteps } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { Arr, Future, Result, Option } from '@ephox/katamari';
import { Focus } from '@ephox/sugar';

import * as Behaviour from 'ephox/alloy/api/behaviour/Behaviour';
import { Focusing } from 'ephox/alloy/api/behaviour/Focusing';
import * as GuiFactory from 'ephox/alloy/api/component/GuiFactory';
import { Container } from 'ephox/alloy/api/ui/Container';
import { tieredMenu as TieredMenu } from 'ephox/alloy/api/ui/TieredMenu';
import { Typeahead } from 'ephox/alloy/api/ui/Typeahead';
import * as TestDropdownMenu from 'ephox/alloy/test/dropdown/TestDropdownMenu';
import * as GuiSetup from 'ephox/alloy/api/testhelpers/GuiSetup';
import * as Sinks from 'ephox/alloy/test/Sinks';
import * as TestBroadcasts from 'ephox/alloy/test/TestBroadcasts';
import TestTypeaheadSteps from 'ephox/alloy/test/typeahead/TestTypeaheadSteps';

UnitTest.asynctest('Browser Test: .ui.typeahead.TypeaheadNoBlurTest', (success, failure) => {

  GuiSetup.setup((store, doc, body) => {
    const sink = Sinks.relativeSink();

    return GuiFactory.build(
      Container.sketch({
        components: [
          GuiFactory.premade(sink),

          Typeahead.sketch({
            dismissOnBlur: false,

            minChars: 2,
            uid: 'test-type',
            inputClasses: [ 'test-typeahead' ],
            markers: {
              // TODO: Test this
              openClass: 'test-typeahead-open'
            },

            initialData: {
              value: 'initial-value',
              meta: {
                text: 'initial-value'
              }
            },

            fetch (input) {
              const future = Future.pure([
                { type: 'item', data: { value: 'choice1', meta: { text: 'choice1' } } },
                { type: 'item', data: { value: 'choice2', meta: { text: 'choice2' } } }
              ]);

              return future.map((items) => {
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

    const steps = TestTypeaheadSteps(doc, gui, typeahead);

    return [
      GuiSetup.mAddStyles(doc, [
        '.selected-item { background-color: #cadbee; }'
      ]),
      FocusTools.sSetFocus('Focusing typeahead', gui.element(), 'input'),
      Keyboard.sKeydown(doc, Keys.down(), { }),
      steps.sWaitForMenu('Down to activate menu'),

      TestBroadcasts.sDismiss(
        'outer gui element: should close',
        gui,
        gui.element()
      ),
      steps.sWaitForNoMenu('Broadcasting dismiss on outer gui context should close popup'),

      Keyboard.sKeydown(doc, Keys.down(), { }),
      steps.sWaitForMenu('Down to activate menu'),
      // Focus something else.
      Step.sync(() => {
        Focus.focus(component.element());
      }),
      Step.wait(100),
      steps.sWaitForMenu('Blurring should NOT dismiss popup due to setting'),

      Step.sync(() => {
        Focus.focus(typeahead.element());
      }),
      Keyboard.sKeydown(doc, Keys.escape(), { }),
      steps.sWaitForNoMenu('Escape should still dismiss regardless of setting'),

      Logger.t(
        'Checking that with dismissOnBlur = false, we can still select items',
        GeneralSteps.sequence([
          Keyboard.sKeydown(doc, Keys.down(), { }),
          steps.sWaitForMenu('Down to activate menu again'),
          Logger.t(
            'Choose an item with <enter> key',
            Keyboard.sKeydown(doc, Keys.enter(), { })
          ),
          Chain.asStep(component.element(), [
            FocusTools.cGetActiveValue,
            Assertions.cAssertEq('Active value should be the first option', 'choice1')
          ]),
          steps.sWaitForNoMenu('Selecting an item should close the menu'),
        ])
      ),
      GuiSetup.mRemoveStyles
    ];
  }, success, failure);
});
