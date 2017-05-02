asynctest(
  'ToolbarGroupTest',
 
  [
    'ephox.agar.api.ApproxStructure',
    'ephox.agar.api.Assertions',
    'ephox.agar.api.FocusTools',
    'ephox.agar.api.Keyboard',
    'ephox.agar.api.Keys',
    'ephox.agar.api.Step',
    'ephox.alloy.api.behaviour.Behaviour',
    'ephox.alloy.api.behaviour.Focusing',
    'ephox.alloy.api.behaviour.Keying',
    'ephox.alloy.api.component.GuiFactory',
    'ephox.alloy.api.ui.Container',
    'ephox.alloy.api.ui.ToolbarGroup',
    'ephox.alloy.test.GuiSetup'
  ],
 
  function (ApproxStructure, Assertions, FocusTools, Keyboard, Keys, Step, Behaviour, Focusing, Keying, GuiFactory, Container, ToolbarGroup, GuiSetup) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    GuiSetup.setup(function (store, doc, body) {
      return GuiFactory.build(
        ToolbarGroup.sketch({
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
                return Container.sketch({
                  dom: {
                    tag: 'button',
                    innerHtml: itemSpec.data.text
                  },

                  containerBehaviours: Behaviour.derive([
                    Focusing.config({ })
                  ])
                });
              }
            }
          },

          markers: {
            itemClass: 'toolbar-item'
          },

          parts: {
            items: {
              dom: {
                tag: 'div',
                classes: [ 'group-items' ]
              }
            }
          }
        })
      );

    }, function (doc, body, gui, component, store) {
      return [
        Assertions.sAssertStructure(
          'Checking initial toolbar groups',
          ApproxStructure.build(function (s, str, arr) {
            return s.element('div', {
              classes: [ arr.not('group-items') ],
              attrs: {
                role: str.is('toolbar'),
                'data-alloy-tabstop': str.is('true')
              },
              children: [
                s.element('button', { html: str.is('A') }),
                s.element('button', { html: str.is('B') })
              ]
            });
          }),
          component.element()
        ),

        Step.sync(function () {
          Keying.focusIn(component);
        }),

        FocusTools.sTryOnSelector('Focus should start on A', doc, 'button:contains("A")'),
        Keyboard.sKeydown(doc, Keys.right(), { }),
        FocusTools.sTryOnSelector('Focus should move to B', doc, 'button:contains("B")')
      ];
    }, function () { success(); }, failure);

  }
);