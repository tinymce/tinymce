asynctest(
  'TabSection Test',

  [
    'ephox.agar.api.ApproxStructure',
    'ephox.agar.api.Assertions',
    'ephox.agar.api.Step',
    'ephox.alloy.api.component.GuiFactory',
    'ephox.alloy.api.ui.Container',
    'ephox.alloy.api.ui.TabSection',
    'ephox.alloy.api.ui.Tabbar',
    'ephox.alloy.test.GuiSetup',
    'ephox.katamari.api.Fun'
  ],

  function (ApproxStructure, Assertions, Step, GuiFactory, Container, TabSection, Tabbar, GuiSetup, Fun) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    GuiSetup.setup(function (store, doc, body) {
      return GuiFactory.build(
        TabSection.sketch({
          dom: {
            tag: 'div'
          },
          components: [
            TabSection.parts().tabbar(),
            TabSection.parts().tabview()
          ],

          tabs: [
            {
              value: 'alpha',
              dom: { tag: 'button', innerHtml: 'A' },
              view: function () {
                return [
                  Container.sketch({
                    dom: {
                      innerHtml: 'This is the view for "A"'
                    },
                    components: [ ]
                  })
                ];
              }
            }
          ],

          parts: {
            tabbar: {
              dom: {
                tag: 'div'
              },
              components: [
                Tabbar.parts().tabs()
              ],
              members: {
                tab: {
                  munge: Fun.identity
                }
              },
              parts: {
                'tabs': { }
              },
              markers: {
                tabClass: 'test-tab-button',
                selectedClass: 'selected-test-tab-button'
              }
            },
            tabview: {
              dom: {
                tag: 'div'
              }
            }
          }
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
                children: [
                  s.element('button', {
                    html: str.is('A'),
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

        GuiSetup.mRemoveStyles
      ];
    }, function () { success(); }, failure);

  }
);