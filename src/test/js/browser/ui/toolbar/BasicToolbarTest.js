asynctest(
  'BasicToolbarTest',
 
  [
    'ephox.agar.api.ApproxStructure',
    'ephox.agar.api.Assertions',
    'ephox.agar.api.Step',
    'ephox.alloy.api.GuiFactory',
    'ephox.alloy.api.ui.Toolbar',
    'ephox.alloy.test.GuiSetup',
    'ephox.alloy.test.toolbar.TestPartialToolbarGroup'
  ],
 
  function (ApproxStructure, Assertions, Step, GuiFactory, Toolbar, GuiSetup, TestPartialToolbarGroup) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    GuiSetup.setup(function (store, doc, body) {
      return GuiFactory.build(
        {
          uiType: 'custom',
          dom: {
            tag: 'div'
          },
          components: [
            Toolbar.build({
              uid: 'shell-toolbar',
              shell: true,
              dom: {
                tag: 'div'
              },

              members: {
                group: {
                  munge: TestPartialToolbarGroup.munge
                }
              },
              parts: {
                groups: { }
              }
            }),

            Toolbar.build({
              uid: 'not-shell-toolbar',
              shell: false,
              dom: {
                tag: 'div'
              },
              components: [
                Toolbar.parts().groups()
              ],

              members: {
                group: {
                  munge: TestPartialToolbarGroup.munge
                }
              },

              parts: {
                groups: {
                  dom: {
                    tag: 'div'
                  }
                }
              }
            })
          ]
        }        
      );

    }, function (doc, body, gui, component, store) {
      var t1 = component.getSystem().getByUid('shell-toolbar').getOrDie();
      var t2 = component.getSystem().getByUid('not-shell-toolbar').getOrDie();
      return [
        Assertions.sAssertStructure(
          'Checking initial structure of toolbar',
          ApproxStructure.build(function (s, str, arr) {
            return s.element('div', {
              children: [
                s.element('div', {
                  children: [ ]
                }),
                s.element('div', {
                  children: [
                    s.element('div', { })
                  ]
                })
              ]
            });
          }),
          component.element()
        ),

        Step.sync(function () {
          var groups = Toolbar.createGroups(t1, [
            {
              value: 'a',
              text: 'A',
              items: [ 'a1', 'a2' ]
            }
          ]);
          console.log('groups', groups);
          // Toolbar.buildGroups()
        }),

        Step.fail('in progress')
      ];
    }, function () { success(); }, failure);

  }
);