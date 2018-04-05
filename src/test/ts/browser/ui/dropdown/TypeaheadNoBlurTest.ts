import { FocusTools, Keyboard, Keys, Step } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { Arr, Future, Result } from '@ephox/katamari';
import { Focus, Value } from '@ephox/sugar';
import * as Behaviour from 'ephox/alloy/api/behaviour/Behaviour';
import { Focusing } from 'ephox/alloy/api/behaviour/Focusing';
import * as GuiFactory from 'ephox/alloy/api/component/GuiFactory';
import { Container } from 'ephox/alloy/api/ui/Container';
import { TieredMenu } from 'ephox/alloy/api/ui/TieredMenu';
import { Typeahead } from 'ephox/alloy/api/ui/Typeahead';
import TestDropdownMenu from 'ephox/alloy/test/dropdown/TestDropdownMenu';
import GuiSetup from 'ephox/alloy/test/GuiSetup';
import Sinks from 'ephox/alloy/test/Sinks';
import TestBroadcasts from 'ephox/alloy/test/TestBroadcasts';
import TestTypeaheadSteps from 'ephox/alloy/test/typeahead/TestTypeaheadSteps';

UnitTest.asynctest('Browser Test: .ui.dropdown.TypeaheadNoBlurTest', function () {
  const success = arguments[arguments.length - 2];
  const failure = arguments[arguments.length - 1];

  GuiSetup.setup(function (store, doc, body) {
    const sink = Sinks.relativeSink();

    return GuiFactory.build(
      Container.sketch({
        components: [
          GuiFactory.premade(sink),

          Typeahead.sketch({
            dismissOnBlur: false,

            minChars: 2,
            uid: 'test-type',
            markers: {
              // TODO: Test this
              openClass: 'test-typeahead-open'
            },

            dom: {
              tag: 'input'
            },
            data: {
              value: 'initial-value',
              text: 'initial-value'
            },

            fetch (input) {
              const text = Value.get(input.element());
              const future = Future.pure([
                { type: 'item', data: { value: text + '1', text: text + '1' } },
                { type: 'item', data: { value: text + '2', text: text + '2' } }
              ]);

              return future.map(function (f) {
                // TODO: Test this.
                const items = text === 'no-data' ? [
                  { type: 'separator', text: 'No data', data: {value: '', text: 'No data'} }
                ] : f;
                const menu = TestDropdownMenu.renderMenu({
                  value: 'blah',
                  items: Arr.map(items, TestDropdownMenu.renderItem)
                });
                return TieredMenu.singleData('blah.overall', menu);
              });
            },

            lazySink () { return Result.value(sink); },

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

  }, function (doc, body, gui, component, store) {

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
      Step.sync(function () {
        Focus.focus(component.element());
      }),
      Step.wait(1000),
      steps.sWaitForMenu('Blurring should NOT dismiss popup due to setting'),

      Step.sync(function () {
        Focus.focus(typeahead.element());
      }),
      Keyboard.sKeydown(doc, Keys.escape(), { }),
      steps.sWaitForNoMenu('Escape should still dismiss regardless of setting'),
      GuiSetup.mRemoveStyles
    ];
  }, success, failure);
});
