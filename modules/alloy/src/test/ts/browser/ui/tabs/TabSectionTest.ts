import { ApproxStructure, Assertions, GeneralSteps, Logger, Step, StructAssert } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { Element, SelectorFind } from '@ephox/sugar';

import * as Behaviour from 'ephox/alloy/api/behaviour/Behaviour';
import { Tabstopping } from 'ephox/alloy/api/behaviour/Tabstopping';
import * as GuiFactory from 'ephox/alloy/api/component/GuiFactory';
import * as AlloyTriggers from 'ephox/alloy/api/events/AlloyTriggers';
import * as GuiSetup from 'ephox/alloy/api/testhelpers/GuiSetup';
import { Container } from 'ephox/alloy/api/ui/Container';
import { Tabbar } from 'ephox/alloy/api/ui/Tabbar';
import { TabSection } from 'ephox/alloy/api/ui/TabSection';

UnitTest.asynctest('TabSection Test', (success, failure) => {
  GuiSetup.setup((store, doc, body) => {
    let counterA = 0;
    let counterB = 0;

    return GuiFactory.build(
      TabSection.sketch({
        dom: {
          tag: 'div'
        },
        components: [
          TabSection.parts().tabbar({
            dom: {
              tag: 'div'
            },
            components: [
              Tabbar.parts().tabs({ })
            ],
            markers: {
              tabClass: 'test-tab-button',
              selectedClass: 'selected-test-tab-button'
            },
            tabbarBehaviours: Behaviour.derive([
              Tabstopping.config({ })
            ])
          }),
          TabSection.parts().tabview({
            dom: {
              tag: 'div',
              classes: [ 'test-tabview' ]
            }
          })
        ],

        tabs: [
          {
            uid: 'alpha-tab',
            value: 'alpha',
            dom: { tag: 'button', innerHtml: 'A' },
            view () {
              counterA++;
              return [
                Container.sketch({
                  dom: {
                    innerHtml: 'This is the view for "A' + counterA + '"'
                  },
                  components: [ ]
                })
              ];
            }
          },
          {
            uid: 'beta-tab',
            value: 'beta',
            dom: { tag: 'button', innerHtml: 'B' },
            view () {
              counterB++;
              return [
                Container.sketch({
                  dom: {
                    innerHtml: 'This is the view for "B' + counterB + '"'
                  },
                  components: [ ]
                })
              ];
            }
          }
        ]
      })
    );

  }, (doc, body, gui, component, store) => {
    const alpha = component.getSystem().getByUid('alpha-tab').getOrDie();
    const beta = component.getSystem().getByUid('beta-tab').getOrDie();
    const tview = component.getSystem().getByDom(
      SelectorFind.descendant(component.element(), '.test-tabview').getOrDie('Could not find tabview')
    ).getOrDie();

    const sAssertTabSelection = (label: string, expected: boolean, element: Element) =>
      Assertions.sAssertStructure(label + ' (asserting structure)', ApproxStructure.build((s, str, arr) => {
        return s.element('button', {
          attrs: {
            'aria-selected': expected ? str.is('true') : str.is('false')
          },
          classes: [ (expected ? arr.has : arr.not)('selected-test-tab-button') ]
        });
      }), element);

    const sAssertTabView = (label: string, expected: ApproxStructure.Builder<StructAssert[]>) =>
      Assertions.sAssertStructure(label + ' (asserting structure)', ApproxStructure.build((s, str, arr) => {
        return s.element('div', {
          children: expected(s, str, arr)
        });
      }), tview.element());

    return [
      GuiSetup.mAddStyles(doc, [
        '.selected-test-tab-button { background: #cadbee; }'
      ]),
      Assertions.sAssertStructure('Checking initial tab section', ApproxStructure.build((s, str, arr) => {
        return s.element('div', {
          children: [
            s.element('div', {
              attrs: {
                'data-alloy-tabstop': str.is('true'),
                'role': str.is('tablist')
              },
              children: [
                s.element('button', {
                  html: str.is('A'),
                  attrs: {
                    'data-alloy-id': str.none(),
                    'aria-selected': str.is('true')
                  },
                  classes: [
                    arr.has('test-tab-button')
                  ]
                }),

                s.element('button', {
                  html: str.is('B'),
                  attrs: {
                    'data-alloy-id': str.none(),
                    'aria-selected': str.is('false')
                  },
                  classes: [
                    arr.has('test-tab-button')
                  ]
                })
              ]
            }),
            s.element('div', {
              classes: [ arr.has('test-tabview') ]
            })
          ]
        });
      }), component.element()),

      Logger.t(
        'Execute alpha, check tabs and tabview',
        GeneralSteps.sequence([
          Step.sync(() => {
            AlloyTriggers.emitExecute(alpha);
          }),
          sAssertTabSelection('Check Alpha', true, alpha.element()),
          sAssertTabSelection('Check Beta', false, beta.element()),
          sAssertTabView('Check TabView', (s, str, arr) => [
            s.element('div', {
              html: str.is('This is the view for "A1"')
            })
          ])
        ])
      ),

      Logger.t(
        'Execute beta, check tabs and tabview',
        GeneralSteps.sequence([
          Step.sync(() => {
            AlloyTriggers.emitExecute(beta);
          }),
          sAssertTabSelection('Check Alpha', false, alpha.element()),
          sAssertTabSelection('Check Beta', true, beta.element()),
          sAssertTabView('Check TabView', (s, str, arr) => [
            s.element('div', {
              html: str.is('This is the view for "B1"')
            })
          ])
        ])
      ),

      Logger.t(
        'Execute alpha again, check tabs and tabview. Should be v2',
        GeneralSteps.sequence([
          Step.sync(() => {
            AlloyTriggers.emitExecute(alpha);
          }),
          sAssertTabSelection('Check Alpha', true, alpha.element()),
          sAssertTabSelection('Check Beta', false, beta.element()),
          sAssertTabView('Check TabView', (s, str, arr) => [
            s.element('div', {
              html: str.is('This is the view for "A2"')
            })
          ])
        ])
      ),

      Logger.t(
        'Execute alpha again x 2, check tabs and tabview. Should stay v2',
        GeneralSteps.sequence([
          Step.sync(() => {
            AlloyTriggers.emitExecute(alpha);
          }),
          sAssertTabSelection('Check Alpha', true, alpha.element()),
          sAssertTabSelection('Check Beta', false, beta.element()),
          sAssertTabView('Check TabView', (s, str, arr) => [
            s.element('div', {
              html: str.is('This is the view for "A2"')
            })
          ])
        ])
      ),

      Logger.t(
        'Execute alpha again x 3 (via API), check tabs and tabview. Should still stay v2',
        GeneralSteps.sequence([
          Step.sync(() => {
            TabSection.showTab(component, 'alpha');
          }),
          sAssertTabSelection('Check Alpha', true, alpha.element()),
          sAssertTabSelection('Check Beta', false, beta.element()),
          sAssertTabView('Check TabView', (s, str, arr) => [
            s.element('div', {
              html: str.is('This is the view for "A2"')
            })
          ])
        ])
      ),

      Logger.t(
        'Execute alpha again x 4 (via API), check tabs and tabview. Should still stay v2',
        GeneralSteps.sequence([
          Step.sync(() => {
            TabSection.showTab(component, 'alpha');
          }),
          sAssertTabSelection('Check Alpha', true, alpha.element()),
          sAssertTabSelection('Check Beta', false, beta.element()),
          sAssertTabView('Check TabView', (s, str, arr) => [
            s.element('div', {
              html: str.is('This is the view for "A2"')
            })
          ])
        ])
      ),

      Logger.t(
        'Execute beta (via API), check tabs and tabview. Should still stay v2',
        GeneralSteps.sequence([
          Step.sync(() => {
            TabSection.showTab(component, 'beta');
          }),
          sAssertTabSelection('Check Alpha', false, alpha.element()),
          sAssertTabSelection('Check Beta', true, beta.element()),
          sAssertTabView('Check TabView', (s, str, arr) => [
            s.element('div', {
              html: str.is('This is the view for "B2"')
            })
          ])
        ])
      ),

      GuiSetup.mRemoveStyles
    ];
  }, () => { success(); }, failure);
});
