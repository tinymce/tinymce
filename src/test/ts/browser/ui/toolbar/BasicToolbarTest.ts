import { ApproxStructure } from '@ephox/agar';
import { Assertions } from '@ephox/agar';
import { Step } from '@ephox/agar';
import GuiFactory from 'ephox/alloy/api/component/GuiFactory';
import Button from 'ephox/alloy/api/ui/Button';
import Container from 'ephox/alloy/api/ui/Container';
import Toolbar from 'ephox/alloy/api/ui/Toolbar';
import ToolbarGroup from 'ephox/alloy/api/ui/ToolbarGroup';
import GuiSetup from 'ephox/alloy/test/GuiSetup';
import TestPartialToolbarGroup from 'ephox/alloy/test/toolbar/TestPartialToolbarGroup';
import { Arr } from '@ephox/katamari';
import { Fun } from '@ephox/katamari';
import { UnitTest } from '@ephox/bedrock';

UnitTest.asynctest('BasicToolbarTest', function() {
  var success = arguments[arguments.length - 2];
  var failure = arguments[arguments.length - 1];

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
    var makeButton = function (itemSpec) {
      return Button.sketch({
        dom: {
          tag: 'button',
          innerHtml: itemSpec.text
        }
      });
    };

    var t1 = component.getSystem().getByUid('shell-toolbar').getOrDie();
    var t2 = component.getSystem().getByUid('not-shell-toolbar').getOrDie();

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

