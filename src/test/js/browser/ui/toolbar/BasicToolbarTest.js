asynctest(
  'BasicToolbarTest',

  [
    'ephox.agar.api.ApproxStructure',
    'ephox.agar.api.Assertions',
    'ephox.agar.api.Step',
    'ephox.alloy.api.component.GuiFactory',
    'ephox.alloy.api.ui.Button',
    'ephox.alloy.api.ui.Container',
    'ephox.alloy.api.ui.Toolbar',
    'ephox.alloy.api.ui.ToolbarGroup',
    'ephox.alloy.test.GuiSetup',
    'ephox.alloy.test.toolbar.TestPartialToolbarGroup',
    'ephox.katamari.api.Arr',
    'ephox.katamari.api.Fun'
  ],

  function (ApproxStructure, Assertions, Step, GuiFactory, Button, Container, Toolbar, ToolbarGroup, GuiSetup, TestPartialToolbarGroup, Arr, Fun) {
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

  }
);