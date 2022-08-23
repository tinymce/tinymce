import { ApproxStructure, Assertions, Chain, FocusTools, GeneralSteps, Keyboard, Keys, Logger, Mouse, Step, UiFinder, Waiter } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { Arr, Cell, Fun, Future, Optional, Result, Strings } from '@ephox/katamari';
import { Compare, SelectorFind } from '@ephox/sugar';

import * as Behaviour from 'ephox/alloy/api/behaviour/Behaviour';
import { Positioning } from 'ephox/alloy/api/behaviour/Positioning';
import { Representing } from 'ephox/alloy/api/behaviour/Representing';
import { AlloyComponent } from 'ephox/alloy/api/component/ComponentApi';
import * as GuiFactory from 'ephox/alloy/api/component/GuiFactory';
import * as Memento from 'ephox/alloy/api/component/Memento';
import { SketchSpec } from 'ephox/alloy/api/component/SpecTypes';
import * as GuiSetup from 'ephox/alloy/api/testhelpers/GuiSetup';
import { Container } from 'ephox/alloy/api/ui/Container';
import { Dropdown } from 'ephox/alloy/api/ui/Dropdown';
import { tieredMenu as TieredMenu } from 'ephox/alloy/api/ui/TieredMenu';
import { TestItem } from 'ephox/alloy/test/dropdown/TestDropdownMenu';
import * as TestDropdownMenu from 'ephox/alloy/test/dropdown/TestDropdownMenu';

interface TestDatum {
  readonly code: string;
  readonly selector: string;
  readonly label: string;
  readonly testItem: TestItem;
  readonly sAssertHasFocus: Step<any, any>;
}

UnitTest.asynctest('DropdownRefetchTest', (success, failure) => {

  const memSink = Memento.record(
    Container.sketch({
      containerBehaviours: Behaviour.derive([
        Positioning.config({
          useFixed: Fun.always
        })
      ])
    })
  );

  const resultsStore = Cell([] as TestItem[]);

  GuiSetup.setup((store, _doc, _body) => {
    // We want two nearly identical dropdowns, because we need to test the
    // different branches their Coupling sandbox state.
    const makeDropdown = (className: string): SketchSpec => {
      return Dropdown.sketch({
        dom: {
          tag: 'button',
          classes: [ 'test-dropdown', className ],
          innerHtml: 'Dropdown+Refetch'
        },

        sandboxClasses: [ 'my-test-sandbox' ],
        lazySink: (c) => {
          TestDropdownMenu.assertLazySinkArgs('button', 'test-dropdown', c);
          return Result.value(memSink.get(c));
        },

        toggleClass: 'alloy-selected',

        parts: {
          menu: TestDropdownMenu.part(store)
        },

        fetch: () => {
          // We use a cell here, because when testing fetch, we want to be able
          // to easily change the results.
          const future = Future.pure<TestItem[]>(
            resultsStore.get()
          );

          return future.map((f) => {
            const menu = TestDropdownMenu.renderMenu({
              value: 'v',
              items: Arr.map(f, TestDropdownMenu.renderItem)
            });
            return Optional.some(TieredMenu.singleData('test', menu));
          });
        }
      });
    };

    const c = GuiFactory.build({
      dom: {
        tag: 'div',
        classes: [ 'dropdown-mania' ]
      },
      components: [
        makeDropdown('dropdown1'),
        makeDropdown('dropdown2')
      ]
    });

    return c;

  }, (doc, _body, gui, container, _store) => {
    // We use dropdown1 for all the main tests
    // We use dropdown2 just to test that refetch opens a menu, even if
    // open has never been called before.
    const dropdown1: AlloyComponent = container.getSystem().getByDom(
      SelectorFind.descendant(container.element, '.dropdown1').getOrDie(
        'Could not find the first dropdown in the children'
      )
    ).getOrDie();
    const dropdown2: AlloyComponent = container.getSystem().getByDom(
      SelectorFind.descendant(container.element, '.dropdown2').getOrDie(
        'Could not find the first dropdown in the children'
      )
    ).getOrDie();

    const sink = GuiFactory.build(memSink.asSpec());
    gui.add(sink);

    const testData = Arr.mapToObject([
      'ant',
      'bull',
      'coyote',
      'dingo',
      'elephant',
      'frog',
      'giraffe',
      'hippo',
      'iguana'
    ], (animalName): TestDatum => {
      const text = Strings.capitalize(animalName);
      const selector = `li:contains(${text})`;
      return {
        code: animalName,
        selector,
        label: `${animalName}-item`,
        testItem: {
          type: 'item',
          data: {
            value: animalName,
            meta: {
              text
            }
          }
        },
        sAssertHasFocus: FocusTools.sTryOnSelector(
          `Waiting for item (value: ${animalName}, text: ${text}) to receive focus`,
          doc,
          selector
        )
      };
    });

    const focusables = {
      dropdown1: { label: 'dropdown-button', selector: '.dropdown1' },
      dropdown2: { label: 'dropdown-button', selector: '.dropdown2' }
    };

    // Start the initial results with ant, bull, dingo
    resultsStore.set([
      testData.ant.testItem,
      testData.bull.testItem,
      testData.dingo.testItem
    ]);

    // Change the results, and trigger a refetch and wait until it's done.
    const sTriggerRefetchWith = (dropdown: AlloyComponent, items: TestItem[]): Step<any, any> => Step.async(
      (next) => {
        resultsStore.set(items);
        Dropdown.refetch(dropdown).get(next);
      }
    );

    return [
      GuiSetup.mAddStyles(doc, [
        ':focus { outline: 2px solid green; }'
      ]),

      Logger.t(
        'Testing Dropdown1 (opens before refetches)',
        GeneralSteps.sequence([
          Assertions.sAssertStructure(
            'Initial structure of dropdown1 button',
            ApproxStructure.build((s, str, _arr) => s.element('button', {
              attrs: {
                'aria-expanded': str.is('false'),
                'aria-haspopup': str.is('true'),
                'type': str.is('button')
              }
            })),
            dropdown1.element
          ),

          Mouse.sClickOn(gui.element, focusables.dropdown1.selector),
          // This focus check on ant has the byproduct of waiting until the menu opens.
          testData.ant.sAssertHasFocus,

          Assertions.sAssertStructure(
            'Initial structure of dropdown1 button',
            ApproxStructure.build((s, str, _arr) => s.element('button', {
              attrs: {
                'aria-expanded': str.is('true'),
                'aria-haspopup': str.is('true'),
                'aria-controls': str.contains('aria-controls_')
              }
            })),
            dropdown1.element
          ),

          // Now that the menu is open, check that the Representing.getValue of the
          // sandbox is linked to the dropdown1.
          Chain.isolate(gui.element, Chain.fromChains([
            UiFinder.cFindIn('.my-test-sandbox'),
            Chain.binder((sandbox) => dropdown1.getSystem().getByDom(sandbox)),
            Chain.op((sandboxComp) => {
              Assertions.assertEq('Checking Representing.getValue of sandbox is dropdown1', true, Compare.eq(dropdown1.element, Representing.getValue(sandboxComp).element));
            })
          ])),

          // Change the results, and trigger a refetch and wait until it's done.
          // We don't want to close the menu first.
          sTriggerRefetchWith(dropdown1, [
            testData.bull.testItem,
            // Even though ant was the previous focus, we don't try to preserve it.
            testData.ant.testItem,
            testData.iguana.testItem
          ]),

          // Check the menu is still open, but now has focus on bull. Even though ant is still
          // there.
          testData.bull.sAssertHasFocus,

          // Close the menu
          Keyboard.sKeyup(doc, Keys.escape(), { }),
          Waiter.sTryUntil(
            'Waiting for menu to disappear',
            FocusTools.sTryOnSelector('Focus should be back on button', doc, 'button')
          ),

          UiFinder.sNotExists(gui.element, '.menu'),

          // Call refetch and check it still opens (even though the menu is closed)
          // and highlights its first result
          sTriggerRefetchWith(dropdown1, [
            testData.dingo.testItem,
            // Even though ant was the previous focus, we don't try to preserve it.
            testData.elephant.testItem,
            testData.hippo.testItem
          ]),

          testData.dingo.sAssertHasFocus
        ])
      ),

      Logger.t(
        'Testing Dropdown2 (refetch before open) will still open on refetch',
        GeneralSteps.sequence([
          // Focus the dropdown first, so that we can check if focus
          // is transferred to the item after refetch
          FocusTools.sSetFocus(
            'Focus dropdown 2',
            container.element,
            focusables.dropdown2.selector
          ),
          sTriggerRefetchWith(
            dropdown2,
            [
              testData.coyote.testItem,
              testData.elephant.testItem
            ]
          ),

          testData.coyote.sAssertHasFocus
        ])
      ),

      GuiSetup.mRemoveStyles
    ];
  }, success, failure);
});
