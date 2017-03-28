define(
  'tinymce.themes.mobile.demo.FormDemo',

  [
    'ephox.alloy.api.component.GuiFactory',
    'ephox.alloy.api.system.Gui',
    'ephox.alloy.api.ui.Input',
    'ephox.sugar.api.dom.Insert',
    'ephox.sugar.api.search.SelectorFind',
    'tinymce.themes.mobile.ui.SerialisedDialog'
  ],

  function (GuiFactory, Gui, Input, Insert, SelectorFind, SerialisedDialog) {
    return function () {
      var ephoxUi = SelectorFind.first('#ephox-ui').getOrDie();

      var form = GuiFactory.build(
        SerialisedDialog.sketch({
          onExecute: function () { },
          fields: [
            {
              name: 'alpha',
              spec: Input.sketch({
                dom: {
                  attributes: {
                    placeholder: 'alpha'
                  }
                }
              })
            },
            {
              name: 'beta',
              spec: Input.sketch({
                dom: {
                  attributes: {
                    placeholder: 'beta'
                  }
                }
              })
            },
            {
              name: 'gamma',
              spec: Input.sketch({
                dom: {
                  attributes: {
                    placeholder: 'gamma'
                  }
                }
              })
            },
            {
              name: 'delta',
              spec: Input.sketch({
                dom: {
                  attributes: {
                    placeholder: 'delta'
                  }
                }
              })
            }
          ]
        })
      )

      var gui = Gui.create();
      Insert.append(ephoxUi, gui.element());

      gui.add(form);
    };
  }
);