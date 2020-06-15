import { FocusTools, Keyboard, Keys } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { Arr, Future, Option, Result } from '@ephox/katamari';
import { Node } from '@ephox/sugar';

import * as Behaviour from 'ephox/alloy/api/behaviour/Behaviour';
import { Focusing } from 'ephox/alloy/api/behaviour/Focusing';
import * as GuiFactory from 'ephox/alloy/api/component/GuiFactory';
import * as GuiSetup from 'ephox/alloy/api/testhelpers/GuiSetup';
import { Container } from 'ephox/alloy/api/ui/Container';
import { tieredMenu as TieredMenu } from 'ephox/alloy/api/ui/TieredMenu';
import { Typeahead } from 'ephox/alloy/api/ui/Typeahead';
import * as TestDropdownMenu from 'ephox/alloy/test/dropdown/TestDropdownMenu';
import * as Sinks from 'ephox/alloy/test/Sinks';
import TestTypeaheadSteps from 'ephox/alloy/test/typeahead/TestTypeaheadSteps';

UnitTest.asynctest('Browser Test: .ui.typeahead.TypeaheadEscEnterBubbleTest', (success, failure) => {

  GuiSetup.setup((store, _doc, _body) => {
    const sink = Sinks.relativeSink();

    return GuiFactory.build(
      Container.sketch({
        components: [
          GuiFactory.premade(sink),

          Typeahead.sketch({
            minChars: 1,
            uid: 'test-type',
            inputClasses: [ 'test-typeahead' ],
            markers: {
              openClass: 'test-typeahead-open'
            },

            model: {
              // If selectsOver is true, then highlighting happens automatically, and there isn't
              // really a "previewing" mode. Set this to false so that the highlighting
              // isn't fired automatically when the menu opens
              selectsOver: false
            },

            fetch() {
              const items = [
                { type: 'item', data: { value: '1', meta: { text: '1' }}},
                { type: 'item', data: { value: '2', meta: { text: '2' }}}
              ];

              return Future.pure(Option.some(TieredMenu.singleData('blah.overall', TestDropdownMenu.renderMenu({
                value: 'blah',
                items: Arr.map(items, TestDropdownMenu.renderItem)
              }))));
            },

            lazySink(c) {
              TestDropdownMenu.assertLazySinkArgs('input', 'test-typeahead', c);
              return Result.value(sink);
            },

            parts: {
              menu: TestDropdownMenu.part(store)
            },
            onExecute: store.adder('***onExecute***'),
            onItemExecute: (typeahead, sandbox, item, value) => {
              store.adder(value.value + '(' + Arr.map([ typeahead.element(), sandbox.element(), item.element() ], Node.name).join('-') + ')')();
            }
          })
        ],

        containerBehaviours: Behaviour.derive([
          Focusing.config({ })
        ])
      })
    );

  }, (doc, body, gui, _component, store) => {

    const typeahead = gui.getByUid('test-type').getOrDie();

    const steps = TestTypeaheadSteps(doc, gui, typeahead);

    return [
      GuiSetup.mSetupKeyLogger(body),
      GuiSetup.mAddStyles(doc, [
        '.selected-item { background-color: #cadbee; }'
      ]),
      FocusTools.sSetFocus('Focusing typeahead', gui.element(), 'input'),
      Keyboard.sKeydown(doc, Keys.down(), { }),
      steps.sWaitForMenu('Down to activate menu'),
      Keyboard.sKeydown(doc, Keys.escape(), {}),
      steps.sWaitForNoMenu('Esc to close menu'),
      Keyboard.sKeydown(doc, Keys.escape(), {}),

      FocusTools.sSetFocus('Focusing typeahead', gui.element(), 'input'),
      Keyboard.sKeydown(doc, Keys.down(), { }),
      steps.sWaitForMenu('Down to activate menu'),
      Keyboard.sKeydown(doc, Keys.enter(), {}),
      steps.sWaitForNoMenu('Enter to close menu'),
      Keyboard.sKeydown(doc, Keys.enter(), {}),
      store.sAssertEq('Should have item1 and onExecute', [ '1(input-div-li)', '***onExecute***' ]),

      FocusTools.sSetFocus('Focusing typeahead to open preview mode', gui.element(), 'input'),
      FocusTools.sSetActiveValue(doc, 'al'),
      steps.sTriggerInputEvent('Simulate typing to show menu with "al"'),
      steps.sWaitForMenu('"Typing" should activate menu'),
      store.sClear,
      store.sAssertEq('Sanity check that clear worked', [ ]),
      Keyboard.sKeydown(doc, Keys.enter(), { }),
      steps.sWaitForNoMenu('Enter should close menu (in previewing mode)'),
      store.sAssertEq('Pressing <enter> in preview mode should execute', [ '***onExecute***' ]),

      GuiSetup.mRemoveStyles,
      GuiSetup.mTeardownKeyLogger(body, [ 'keydown.to.body: 27' ])
    ];
  }, success, failure);
});
