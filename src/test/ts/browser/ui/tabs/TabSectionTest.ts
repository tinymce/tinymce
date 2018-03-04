import { ApproxStructure, Assertions, Step } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import * as Behaviour from 'ephox/alloy/api/behaviour/Behaviour';
import Tabstopping from 'ephox/alloy/api/behaviour/Tabstopping';
import * as GuiFactory from 'ephox/alloy/api/component/GuiFactory';
import * as AlloyTriggers from 'ephox/alloy/api/events/AlloyTriggers';
import Container from 'ephox/alloy/api/ui/Container';
import Tabbar from 'ephox/alloy/api/ui/Tabbar';
import TabSection from 'ephox/alloy/api/ui/TabSection';
import GuiSetup from 'ephox/alloy/test/GuiSetup';

UnitTest.asynctest('TabSection Test', function () {
  const success = arguments[arguments.length - 2];
  const failure = arguments[arguments.length - 1];

  GuiSetup.setup(function (store, doc, body) {
    return GuiFactory.build(
      TabSection.sketch({
        selectFirst: false,
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
              tag: 'div'
            }
          })
        ],

        tabs: [
          {
            uid: 'alpha-tab',
            value: 'alpha',
            dom: { tag: 'button', innerHtml: 'A' },
            view () {
              return [
                Container.sketch({
                  dom: {
                    innerHtml: 'This is the view for "A"'
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
              return [
                Container.sketch({
                  dom: {
                    innerHtml: 'This is the view for "B"'
                  },
                  components: [ ]
                })
              ];
            }
          }
        ]
      })
    );

  }, function (doc, body, gui, component, store) {
    return [
      GuiSetup.mAddStyles(doc, [
        '.selected-test-tab-button { background: #cadbee; }'
      ]),
      Assertions.sAssertStructure('Checking initial tab section', ApproxStructure.build(function (s, str, arr) {
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
                    'data-alloy-id': str.is('alpha-tab'),
                    'aria-selected': str.is('false')
                  },
                  classes: [
                    arr.has('test-tab-button')
                  ]
                }),

                s.element('button', {
                  html: str.is('B'),
                  attrs: {
                    'data-alloy-id': str.is('beta-tab'),
                    'aria-selected': str.is('false')
                  },
                  classes: [
                    arr.has('test-tab-button')
                  ]
                })
              ]
            }),
            s.element('div', { })
          ]
        });
      }), component.element()),

      Step.sync(function () {
        const alpha = component.getSystem().getByUid('alpha-tab').getOrDie();
        AlloyTriggers.emitExecute(alpha);
        const beta = component.getSystem().getByUid('beta-tab').getOrDie();
        Assertions.assertStructure('alpha after execute(alpha)', ApproxStructure.build(function (s, str, arr) {
          return s.element('button', {
            attrs: {
              'aria-selected': str.is('true')
            },
            classes: [ arr.has('selected-test-tab-button') ]
          });
        }), alpha.element());
        Assertions.assertStructure('beta after execute(alpha)', ApproxStructure.build(function (s, str, arr) {
          return s.element('button', {
            attrs: {
              'aria-selected': str.is('false')
            },
            classes: [ arr.not('selected-test-tab-button') ]
          });
        }), beta.element());
      }),

      GuiSetup.mRemoveStyles
    ];
  }, function () { success(); }, failure);
});
