import { FocusTools, Keyboard, Keys } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { Arr, Future, Result, Fun } from '@ephox/katamari';
import { Value, Node } from '@ephox/sugar';
import * as Behaviour from 'ephox/alloy/api/behaviour/Behaviour';
import { Focusing } from 'ephox/alloy/api/behaviour/Focusing';
import * as GuiFactory from 'ephox/alloy/api/component/GuiFactory';
import { Container } from 'ephox/alloy/api/ui/Container';
import { tieredMenu as TieredMenu } from 'ephox/alloy/api/ui/TieredMenu';
import { Typeahead } from 'ephox/alloy/api/ui/Typeahead';
import * as TestDropdownMenu from 'ephox/alloy/test/dropdown/TestDropdownMenu';
import * as GuiSetup from 'ephox/alloy/test/GuiSetup';
import * as Sinks from 'ephox/alloy/test/Sinks';
import TestTypeaheadSteps from 'ephox/alloy/test/typeahead/TestTypeaheadSteps';

UnitTest.asynctest('Browser Test: .ui.typeahead.TypeaheadEscEnterBubbleTest', (success, failure) => {

  GuiSetup.setup((store, doc, body) => {
    const sink = Sinks.relativeSink();

    return GuiFactory.build(
      Container.sketch({
        components: [
          GuiFactory.premade(sink),

          Typeahead.sketch({
            minChars: 1,
            uid: 'test-type',
            markers: {
              openClass: 'test-typeahead-open'
            },

            fetch () {
              const items = [
                { type: 'item', data: { value: '1', meta: { text: '1' } } },
                { type: 'item', data: { value: '2', meta: { text: '2' } } }
              ];

              return Future.pure(TieredMenu.singleData('blah.overall', TestDropdownMenu.renderMenu({
                value: 'blah',
                items: Arr.map(items, TestDropdownMenu.renderItem)
              })))
            },

            lazySink () { return Result.value(sink); },

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

  }, (doc, body, gui, component, store) => {

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
      Keyboard.sKeydown(doc,  Keys.escape(), {}),

      FocusTools.sSetFocus('Focusing typeahead', gui.element(), 'input'),
      Keyboard.sKeydown(doc, Keys.down(), { }),
      steps.sWaitForMenu('Down to activate menu'),
      Keyboard.sKeydown(doc, Keys.enter(), {}),
      steps.sWaitForNoMenu('Enter to close menu'),
      Keyboard.sKeydown(doc,  Keys.enter(), {}),

      store.sAssertEq('Should have item1 and onExecute', ['1(input-div-li)', '***onExecute***']),
      GuiSetup.mRemoveStyles,
      GuiSetup.mTeardownKeyLogger(body, ['keydown.to.body: 27']),
    ];
  }, success, failure);
});
