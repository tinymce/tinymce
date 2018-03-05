import { ApproxStructure, Assertions, Step } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { Arr } from '@ephox/katamari';
import * as GuiFactory from 'ephox/alloy/api/component/GuiFactory';
import Button from 'ephox/alloy/api/ui/Button';
import { Container } from 'ephox/alloy/api/ui/Container';
import Toolbar from 'ephox/alloy/api/ui/Toolbar';
import GuiSetup from 'ephox/alloy/test/GuiSetup';
import TestPartialToolbarGroup from 'ephox/alloy/test/toolbar/TestPartialToolbarGroup';

UnitTest.asynctest('BasicToolbarTest', function () {
  const success = arguments[arguments.length - 2];
  const failure = arguments[arguments.length - 1];

  GuiSetup.setup(function (store, doc, body) {
    return GuiFactory.build(
      Container.sketch({
        components: [
          Toolbar.sketch({
            uid: 'shell-toolbar',
            shell: true,
            dom: {
              tag: 'div',
              attributes: {
                'data-group-container': 'true'
              }
            }
          }),

          Toolbar.sketch({
            uid: 'not-shell-toolbar',
            shell: false,
            dom: {
              tag: 'div'
            },
            components: [
              Toolbar.parts().groups({
                dom: {
                  tag: 'div',
                  attributes: {
                    'data-group-container': 'true'
                  }
                }
              })
            ]
          })
        ]
      })
    );

  }, function (doc, body, gui, component, store) {
    const makeButton = function (itemSpec) {
      return Button.sketch({
        dom: {
          tag: 'button',
          innerHtml: itemSpec.text
        }
      });
    };

    const t1 = component.getSystem().getByUid('shell-toolbar').getOrDie();
    const t2 = component.getSystem().getByUid('not-shell-toolbar').getOrDie();

    return [
      GuiSetup.mAddStyles(doc, [
        '[data-alloy-id="not-shell-toolbar"] { padding-top: 10px; padding-bottom: 10px; background: blue }',
        '[data-alloy-id="not-shell-toolbar"] div { background: black; }'
      ]),

      Assertions.sAssertStructure(
        'Checking initial structure of toolbar',
        ApproxStructure.build(function (s, str, arr) {
          return s.element('div', {
            children: [
              s.element('div', {
                attrs: {
                  'data-group-container': str.is('true')
                },
                children: [ ]
              }),
              s.element('div', {
                children: [
                  s.element('div', {
                    attrs: {
                      'data-group-container': str.is('true')
                    }
                  })
                ]
              })
            ]
          });
        }),
        component.element()
      ),

      Step.sync(function () {
        TestPartialToolbarGroup.setGroups(t1, [
          {
            items: Arr.map([ { text: 'a1' }, { text: 'a2' } ], makeButton)
          }
        ]);
      }),

      Assertions.sAssertStructure(
        'Checking structure of toolbar after adding groups to shell-toolbar',
        ApproxStructure.build(function (s, str, arr) {
          return s.element('div', {
            children: [
              s.element('div', {
                attrs: {
                  'data-group-container': str.is('true')
                },
                children: [
                  s.element('div', {
                    attrs: {
                      role: str.is('toolbar')
                    },
                    children: [
                      s.element('button', { html: str.is('a1') }),
                      s.element('button', { html: str.is('a2') })
                    ]
                  })
                ]
              }),
              s.element('div', {
                children: [
                  s.element('div', {
                    attrs: {
                      'data-group-container': str.is('true')
                    },
                    children: [ ]
                  })
                ]
              })
            ]
          });
        }),
        component.element()
      ),

      Step.sync(function () {
        TestPartialToolbarGroup.setGroups(t2, [
          {
            items: Arr.map([ { text: 'b1' }, { text: 'b2' } ], makeButton)
          }
        ]);
      }),

      Assertions.sAssertStructure(
        'Checking structure of toolbar after adding groups to not-shell-toolbar',
        ApproxStructure.build(function (s, str, arr) {
          return s.element('div', {
            children: [
              s.element('div', {
                attrs: {
                  'data-group-container': str.is('true')
                },
                children: [
                  s.element('div', {
                    attrs: {
                      role: str.is('toolbar')
                    },
                    children: [
                      s.element('button', { html: str.is('a1') }),
                      s.element('button', { html: str.is('a2') })
                    ]
                  })
                ]
              }),
              s.element('div', {
                children: [
                  s.element('div', {
                    attrs: {
                      'data-group-container': str.is('true')
                    },
                    children: [
                      s.element('div', {
                        attrs: {
                          role: str.is('toolbar')
                        },
                        children: [
                          s.element('button', { html: str.is('b1') }),
                          s.element('button', { html: str.is('b2') })
                        ]
                      })
                    ]
                  })
                ]
              })
            ]
          });
        }),
        component.element()
      ),

      GuiSetup.mRemoveStyles
    ];
  }, function () { success(); }, failure);
});
