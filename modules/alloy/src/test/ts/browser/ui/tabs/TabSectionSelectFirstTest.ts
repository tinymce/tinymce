import { ApproxStructure, Assertions } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import * as Behaviour from 'ephox/alloy/api/behaviour/Behaviour';
import { Tabstopping } from 'ephox/alloy/api/behaviour/Tabstopping';
import * as GuiFactory from 'ephox/alloy/api/component/GuiFactory';
import { Container } from 'ephox/alloy/api/ui/Container';
import { Tabbar } from 'ephox/alloy/api/ui/Tabbar';
import { TabSection } from 'ephox/alloy/api/ui/TabSection';
import * as GuiSetup from 'ephox/alloy/api/testhelpers/GuiSetup';

UnitTest.asynctest('TabSectionSelectFirst Test', (success, failure) => {
  GuiSetup.setup((store, doc, body) => {
    let counterA = 0;
    let counterB = 0;

    return GuiFactory.build(
      TabSection.sketch({
        dom: {
          tag: 'div'
        },
        selectFirst: false,
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
                    'aria-selected': str.is('false')
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

      GuiSetup.mRemoveStyles
    ];
  }, () => { success(); }, failure);
});
