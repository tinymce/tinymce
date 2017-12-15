import { FocusTools } from '@ephox/agar';
import { Keyboard } from '@ephox/agar';
import { Keys } from '@ephox/agar';
import { RealKeys } from '@ephox/agar';
import { UiControls } from '@ephox/agar';
import GuiFactory from 'ephox/alloy/api/component/GuiFactory';
import Container from 'ephox/alloy/api/ui/Container';
import TieredMenu from 'ephox/alloy/api/ui/TieredMenu';
import Typeahead from 'ephox/alloy/api/ui/Typeahead';
import TestDropdownMenu from 'ephox/alloy/test/dropdown/TestDropdownMenu';
import GuiSetup from 'ephox/alloy/test/GuiSetup';
import Sinks from 'ephox/alloy/test/Sinks';
import TestTypeaheadSteps from 'ephox/alloy/test/typeahead/TestTypeaheadSteps';
import { Arr } from '@ephox/katamari';
import { Future } from '@ephox/katamari';
import { Result } from '@ephox/katamari';
import { Value } from '@ephox/sugar';
import { UnitTest } from '@ephox/bedrock';

UnitTest.asynctest('TypeaheadSpecTest', function() {
  var success = arguments[arguments.length - 2];
  var failure = arguments[arguments.length - 1];

  GuiSetup.setup(function (store, doc, body) {
    var sink = Sinks.relativeSink();

    return GuiFactory.build(
      Container.sketch({
        components: [
          GuiFactory.premade(sink),
          Typeahead.sketch({
            uid: 'test-type',
            minChars: 2,
            dom: {
              tag: 'input'
            },
            data: {
              value: 'initial-value',
              text: 'initial-value'
            },

            markers: {
              openClass: 'test-typeahead-open'
            },

            fetch: function (input) {
              var text = Value.get(input.element());
              var future = Future.pure([
                { type: 'item', data: { value: text + '1', text: text + '1' } },
                { type: 'item', data: { value: text + '2', text: text + '2' } }
              ]);

              return future.map(function (f) {
                // TODO: Test this.
                var items = text === 'no-data' ? [
                  { type: 'separator', text: 'No data' }
                ] : f;
                var menu = TestDropdownMenu.renderMenu({
                  value: 'blah',
                  items: Arr.map(items, TestDropdownMenu.renderItem)
                });
                return TieredMenu.singleData('blah.overall', menu);
              });
            },

            lazySink: function () { return Result.value(sink); },

            parts: {
              menu: TestDropdownMenu.part(store)
            }
          })
        ]
      })
    );

  }, function (doc, body, gui, component, store) {

    var typeahead = gui.getByUid('test-type').getOrDie();
    var steps = TestTypeaheadSteps(doc, gui, typeahead);

    return [
      FocusTools.sSetFocus('Focusing typeahead', gui.element(), 'input'),

      GuiSetup.mAddStyles(doc, [
        '.test-typeahead-selected-item { background-color: #cadbee; }'
      ]),

      steps.sAssertValue('Initial value of typeahead', 'initial-value'),
      UiControls.sSetValue(typeahead.element(), 'a-'),

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
  }, function () { success(); }, failure);
});

