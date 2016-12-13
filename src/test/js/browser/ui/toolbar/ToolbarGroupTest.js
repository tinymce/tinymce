asynctest(
  'ToolbarGroupTest',
 
  [
    'ephox.agar.api.ApproxStructure',
    'ephox.agar.api.Assertions',
    'ephox.agar.api.Step',
    'ephox.alloy.api.GuiFactory',
    'ephox.alloy.api.ui.ToolbarGroup',
    'ephox.alloy.test.GuiSetup'
  ],
 
  function (ApproxStructure, Assertions, Step, GuiFactory, ToolbarGroup, GuiSetup) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    GuiSetup.setup(function (store, doc, body) {
      return GuiFactory.build(
        ToolbarGroup.build({
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
                role: str.is('toolbar')
              },
              children: [
                s.element('button', { html: str.is('A') }),
                s.element('button', { html: str.is('B') })
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