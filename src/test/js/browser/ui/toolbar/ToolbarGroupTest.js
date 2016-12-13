asynctest(
  'ToolbarGroupTest',
 
  [
    'ephox.agar.api.ApproxStructure',
    'ephox.agar.api.Assertions',
    'ephox.agar.api.Step',
    'ephox.alloy.api.GuiFactory',
    'ephox.alloy.api.ui.ToolbarGroup',
    'ephox.alloy.test.GuiSetup',
    'ephox.peanut.Fun'
  ],
 
  function (ApproxStructure, Assertions, Step, GuiFactory, ToolbarGroup, GuiSetup, Fun) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    GuiSetup.setup(function (store, doc, body) {
      return GuiFactory.build(
        {
          uiType: 'container',
          components: [
            ToolbarGroup.build({
              uid: 'nested-toolbar',
              dom: {
                tag: 'div'
              },
              components: [
                ToolbarGroup.parts().items()
              ],

              items: [ { data: { value: 'a', text: 'A' } }, { data: { value: 'b', text: 'B' }} ],

              members: {
                item: {
                  munge: function (itemSpec) {
                    return {
                      uiType: 'custom',
                      dom: {
                        tag: 'button',
                        innerHtml: itemSpec.data.text
                      }
                    };
                  }
                }
              },

              parts: {
                items: {
                  dom: {
                    tag: 'div',
                    classes: [ 'group-items' ]
                  }
                }
              }
            }),

            ToolbarGroup.build({
              uid: 'shell-toolbar',
              dom: { tag: 'div' },
              shell: true,
              components: [ ],
              items: [ { data: { value: 'a', text: 'A' } }, { data: { value: 'b', text: 'B' }} ],
              members: {
                item: {
                  munge: function (itemSpec) {
                    return {
                      uiType: 'custom',
                      dom: {
                        tag: 'button',
                        innerHtml: itemSpec.data.text
                      }
                    };
                  }
                }
              },

              parts: { items: { dom: { tag: 'div', classes: [ 'group-items' ] } } }
            })
          ]
        }
      );

    }, function (doc, body, gui, component, store) {
      var shelled = component.getSystem().getByUid('shell-toolbar').getOrDie();
      var nested = component.getSystem().getByUid('nested-toolbar').getOrDie();

      return [
        Assertions.sAssertStructure(
          'Checking initial toolbar groups',
          ApproxStructure.build(function (s, str, arr) {
            return s.element('div', {
              children: [
                s.element('div', {
                  attrs: {
                    'data-alloy-id': str.is('nested-toolbar')
                  },
                  classes: [ arr.not('group-items') ],
                  children: [
                    s.element('div', {
                      children: [
                        s.element('button', { html: str.is('A') }),
                        s.element('button', { html: str.is('B') })
                      ]
                    })
                  ]
                }),
                s.element('div', {
                  attrs: {
                    'data-alloy-id': str.is('shell-toolbar')
                  },
                  classes: [ arr.has('group-items') ],
                  children: [
                    s.element('button', { html: str.is('A') }),
                    s.element('button', { html: str.is('B') })
                  ]
                })
              ]
            });
          }),
          component.element()
        ),
        Step.fail('toolbar.test')
      ];
    }, function () { success(); }, failure);

  }
);