import { Assertions, FocusTools, Keyboard, Keys, Mouse, Step, Touch, UiControls, UiFinder, Waiter } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { Arr, Future, Option, Result, Strings } from '@ephox/katamari';
import { Focus, Value } from '@ephox/sugar';

import * as Behaviour from 'ephox/alloy/api/behaviour/Behaviour';
import { Focusing } from 'ephox/alloy/api/behaviour/Focusing';
import { Representing } from 'ephox/alloy/api/behaviour/Representing';
import * as GuiFactory from 'ephox/alloy/api/component/GuiFactory';
import * as AlloyTriggers from 'ephox/alloy/api/events/AlloyTriggers';
import * as NativeEvents from 'ephox/alloy/api/events/NativeEvents';
import * as GuiSetup from 'ephox/alloy/api/testhelpers/GuiSetup';
import { Container } from 'ephox/alloy/api/ui/Container';
import { tieredMenu as TieredMenu } from 'ephox/alloy/api/ui/TieredMenu';
import { Typeahead } from 'ephox/alloy/api/ui/Typeahead';
import { DatasetRepresentingState } from 'ephox/alloy/behaviour/representing/RepresentingTypes';
import * as DropdownAssertions from 'ephox/alloy/test/dropdown/DropdownAssertions';
import * as TestDropdownMenu from 'ephox/alloy/test/dropdown/TestDropdownMenu';
import * as NavigationUtils from 'ephox/alloy/test/NavigationUtils';
import * as Sinks from 'ephox/alloy/test/Sinks';
import * as TestBroadcasts from 'ephox/alloy/test/TestBroadcasts';
import TestTypeaheadSteps from 'ephox/alloy/test/typeahead/TestTypeaheadSteps';

UnitTest.asynctest('Browser Test: .ui.typeahead.TypeaheadTest', (success, failure) => {

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
                  { type: 'separator', text: 'No data', data: { value: '', meta: { text: 'No data'} } }
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

    const item = (key: string) => {
      return {
        selector: '.selected-item[data-value="' + key + '"]',
        label: key
      };
    };

    const typeahead = gui.getByUid('test-type').getOrDie();

    const steps = TestTypeaheadSteps(doc, gui, typeahead);

    return [
      FocusTools.sSetFocus('Focusing typeahead', gui.element(), 'input'),

      GuiSetup.mAddStyles(doc, [
        '.selected-item { background-color: #cadbee; }'
      ]),

      steps.sAssertValue('Initial value of typeahead', 'initial-value'),
      UiControls.sSetValue(typeahead.element(), 'peo'),

      // check that the typeahead is not open.
      steps.sWaitForNoMenu('Should be no menu initially'),

      Keyboard.sKeydown(doc, Keys.down(), { }),
      steps.sAssertFocusOnTypeahead('Focus stays on typeahead after pressing Down'),
      steps.sWaitForMenu('Down to activate menu'),

      // On typeaheads, there should be a width property that is approximately
      // the same size as the input field
      DropdownAssertions.sSameWidth('Typeahead', gui, typeahead, '.menu'),

      NavigationUtils.highlights(gui.element(), Keys.down(), {}, [
        item('peo2'),
        item('peo1'),
        item('peo2')
      ]),

      Step.sync(() => {
        // Check that the representing state has keys of peo1, peo2 etc.
        const repState = Representing.getState(typeahead) as DatasetRepresentingState;
        const peo1Data = repState.lookup('peo1').getOrDie('Should have dataset data for peo1 now');
        Assertions.assertEq('Checking peo1Data', { value: 'peo1', meta: { text: 'Peo1' } }, peo1Data);

        const peo2Data = repState.lookup('peo2').getOrDie('Should have dataset data for peo2 now');
        Assertions.assertEq('Checking peo2Data', { value: 'peo2', meta: { text: 'Peo2' } }, peo2Data);
      }),

      Keyboard.sKeydown(doc, Keys.enter(), { }),
      steps.sAssertValue('Value after <enter>', 'Peo2'),
      steps.sAssertFocusOnTypeahead('Focus after <enter>'),

      steps.sWaitForNoMenu('No menu after <enter>'),

      UiControls.sSetValue(typeahead.element(), 'new-value'),
      Keyboard.sKeydown(doc, Keys.down(), {}),

      steps.sAssertFocusOnTypeahead('After pressing Down after Enter'),
      steps.sWaitForMenu('After pressing Down after Enter'),
      NavigationUtils.highlights(gui.element(), Keys.down(), {}, [
        item('new-value2'),
        item('new-value1')
      ]),

      Keyboard.sKeydown(doc, Keys.escape(), { }),
      steps.sAssertValue('After pressing ESC', 'New-value1'),
      steps.sAssertFocusOnTypeahead('After pressing ESC'),
      steps.sWaitForNoMenu('After pressing ESC'),

      Keyboard.sKeydown(doc, Keys.down(), {}),
      steps.sAssertFocusOnTypeahead('ESC > Down'),
      steps.sWaitForMenu('ESC > Down'),

      NavigationUtils.highlights(gui.element(), Keys.down(), {}, [
        item('new-value12'),
        item('new-value11')
      ]),

      Mouse.sClickOn(gui.element(), '.item[data-value="new-value12"]'),
      steps.sWaitForNoMenu('After clicking on item'),
      steps.sAssertValue('After clicking on item', 'New-value12'),

      Keyboard.sKeydown(doc, Keys.down(), {}),
      steps.sWaitForMenu('Pressing down to check for tapping popups'),

      Touch.sTapOn(gui.element(), '.item[data-value="new-value122"]'),
      steps.sWaitForNoMenu('After tapping on item'),
      steps.sAssertValue('After tapping on item', 'New-value122'),

      // check dismissing popups
      Keyboard.sKeydown(doc, Keys.down(), { }),
      steps.sWaitForMenu('Pressing down to check for dismissing popups'),
      steps.sAssertFocusOnTypeahead('Pressing down to check for dismissing popups'),
      TestBroadcasts.sDismissOn(
        'typeahead input: should not close',
        gui,
        'input'
      ),
      steps.sWaitForMenu('Broadcasting on input should not dismiss popup'),

      TestBroadcasts.sDismissOn(
        'typeahead list option: should not close',
        gui,
        '.item[data-value="new-value1222"]'
      ),
      steps.sWaitForMenu('Broadcasting on item should not dismiss popup'),

      TestBroadcasts.sDismiss(
        'outer gui element: should close',
        gui,
        gui.element()
      ),
      steps.sWaitForNoMenu('Broadcasting dismiss on outer gui context should close popup'),

      // Trigger menu again
      UiControls.sSetValue(typeahead.element(), 'Neo'),
      Keyboard.sKeydown(doc, Keys.down(), { }),
      steps.sWaitForMenu('Waiting for menu to appear for "neo"'),
      NavigationUtils.highlights(gui.element(), Keys.down(), {}, [
        item('neo2')
      ]),

      TestDropdownMenu.mStoreMenuUid(component),
      UiControls.sSetValue(typeahead.element(), 'Neo'),
      Step.sync(() => {
        AlloyTriggers.emit(typeahead, NativeEvents.input());
      }),
      TestDropdownMenu.mWaitForNewMenu(component),
      Waiter.sTryUntil(
        'Selection should stay on neo2 if possible',
        UiFinder.sExists(gui.element(), item('neo2').selector)
      ),

      // Focus something else.
      Step.sync(() => {
        Focus.focus(component.element());
      }),
      steps.sWaitForNoMenu('Blurring should dismiss popup'),

      Step.sync(() => {
        Representing.setValue(typeahead, {
          value: 'neo3',
          meta: {
            text: 'Neo3'
          }
        });
      }),
      Step.sync(() => {
        const actual = Representing.getValue(typeahead);
        Assertions.assertEq('Checking getValue after setValue', {
          value: 'neo3',
          meta: {
            text: 'Neo3'
          }
        }, actual);
      }),

      GuiSetup.mRemoveStyles

    ];
  }, () => { success(); }, failure);
});
