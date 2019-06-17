import { FocusTools, Keyboard, Keys } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { Arr, Future, Id, Result, Option } from '@ephox/katamari';
import * as Behaviour from 'ephox/alloy/api/behaviour/Behaviour';
import { Focusing } from 'ephox/alloy/api/behaviour/Focusing';
import * as GuiFactory from 'ephox/alloy/api/component/GuiFactory';
import { Container } from 'ephox/alloy/api/ui/Container';
import { TieredData, tieredMenu as TieredMenu } from 'ephox/alloy/api/ui/TieredMenu';
import { Typeahead } from 'ephox/alloy/api/ui/Typeahead';
import * as TestDropdownMenu from 'ephox/alloy/test/dropdown/TestDropdownMenu';
import * as GuiSetup from 'ephox/alloy/api/testhelpers/GuiSetup';
import * as Sinks from 'ephox/alloy/test/Sinks';
import TestTypeaheadSteps from 'ephox/alloy/test/typeahead/TestTypeaheadSteps';
import { AlloyComponent } from 'ephox/alloy/api/component/ComponentApi';

UnitTest.asynctest('Browser Test: .ui.typeahead.TypeaheadNoSelectsOverTest', (success, failure) => {
  const typeaheadMarkers = {
    openClass: 'test-typeahead-open'
  };

  GuiSetup.setup((store, doc, body) => {
    const sink = Sinks.relativeSink();

    const fetch = (input: AlloyComponent): Future<Option<TieredData>> => {
      const future = Future.pure([
        { type: 'item', data: { value: 'alpha', meta: { text: 'Alpha' } } },
        { type: 'item', data: { value: 'beta', meta: { text: 'Beta' } } },
        { type: 'item', data: { value: 'gamma', meta: { text: 'Gamma' } } }
      ]);

      return future.map((items) => {
        const menu = TestDropdownMenu.renderMenu({
          value: Id.generate('single-menu-value'),
          items: Arr.map(items, TestDropdownMenu.renderItem)
        });
        return Option.some(TieredMenu.singleData('overlord', menu));
      });
    };

    return GuiFactory.build(
      Container.sketch({
        components: [
          GuiFactory.premade(sink),

          Typeahead.sketch({
            uid: 'test-type-with-selectover',
            inputClasses: [ 'with-selectover' ],
            minChars: 2,
            model: {
              selectsOver: true,
            },
            markers: typeaheadMarkers,
            initialData: {
              value: 'initial-value',
              meta: {
                text: 'initial-value'
              }
            },
            fetch,
            lazySink (c) {
              TestDropdownMenu.assertLazySinkArgs('input', 'with-selectover', c);
              return Result.value(sink);
            },
            parts: {
              menu: TestDropdownMenu.part(store)
            }
          }),

          Typeahead.sketch({
            uid: 'test-type-without-selectover',
            inputClasses: [ 'without-selectover' ],
            minChars: 2,
            model: {
              selectsOver: false,
            },
            markers: typeaheadMarkers,
            initialData: {
              value: 'initial-value',
              meta: {
                text: 'initial-value'
              }
            },
            fetch,
            lazySink (c) {
              TestDropdownMenu.assertLazySinkArgs('input', 'without-selectover', c);
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
    const testWithSelector = () => {
      const typeahead = gui.getByUid('test-type-with-selectover').getOrDie();

      const steps = TestTypeaheadSteps(doc, gui, typeahead);

      return [
        FocusTools.sSetFocus('Focusing typeahead with selectover', gui.element(), '.with-selectover'),
        FocusTools.sSetActiveValue(doc, 'al'),
        steps.sTriggerInputEvent('Simulate typing to show menu with "al"'),
        steps.sWaitForMenu('"Typing" should activate menu'),
        steps.sAssertValue('Checking non-matching typeahead menu not changing value', 'al'),
        Keyboard.sKeydown(doc, Keys.escape(), { }),
        steps.sWaitForNoMenu('Pressing escape should dismiss menu'),

        FocusTools.sSetActiveValue(doc, 'Al'),
        steps.sTriggerInputEvent('Simulate typing to show menu with "Al"'),
        steps.sWaitForMenu('"Typing" should activate menu and select over because of matching text'),

        steps.sAssertValue('Should change to "Alpha" with it selected over', 'Alpha'),
        steps.sAssertTextSelection('Selects Over Al|pha|', 'Al'.length, 'Alpha'.length),
        Keyboard.sKeydown(doc, Keys.escape(), { }),
        steps.sWaitForNoMenu('Pressing escape should dismiss menu for end of this part of test'),
      ];
    };

    const testWithoutSelector = () => {
      const typeahead = gui.getByUid('test-type-without-selectover').getOrDie();

      const steps = TestTypeaheadSteps(doc, gui, typeahead);

      return [
        FocusTools.sSetFocus('Focusing typeahead without selectover', gui.element(), '.without-selectover'),
        FocusTools.sSetActiveValue(doc, 'al'),
        steps.sTriggerInputEvent('Simulate typing to show menu with "al"'),
        steps.sWaitForMenu('"Typing" should activate menu'),
        steps.sAssertValue('Checking non-matching typeahead menu not changing value', 'al'),
        Keyboard.sKeydown(doc, Keys.escape(), { }),
        steps.sWaitForNoMenu('Pressing escape should dismiss menu'),

        FocusTools.sSetActiveValue(doc, 'Al'),
        steps.sTriggerInputEvent('Simulate typing to show menu with "Al"'),
        steps.sWaitForMenu('"Typing" should activate menu and not select over because the setting is false'),

        steps.sAssertValue('Should keep it as "Al" with selection at end of input', 'Al'),
        steps.sAssertTextSelection('No select over. So "Al"', 'Al'.length, 'Al'.length)
      ];
    };

    return [
      GuiSetup.mAddStyles(doc, [
        '.selected-item { background-color: #cadbee; }'
      ]),
    ].concat(
      testWithSelector(),
      testWithoutSelector()
    ).concat([
      GuiSetup.mRemoveStyles
    ]);
  }, success, failure);
});
