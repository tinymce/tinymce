define(
  'tinymce.themes.mobile.demo.FormDemo',

  [
    'ephox.alloy.api.component.GuiFactory',
    'ephox.alloy.api.system.Gui',
    'ephox.alloy.api.ui.Input',
    'ephox.katamari.api.Option',
    'ephox.sugar.api.dom.Insert',
    'ephox.sugar.api.search.SelectorFind',
    'tinymce.themes.mobile.ui.Inputs',
    'tinymce.themes.mobile.ui.SerialisedDialog'
  ],

  function (GuiFactory, Gui, Input, Option, Insert, SelectorFind, Inputs, SerialisedDialog) {
    return function () {
      var ephoxUi = SelectorFind.first('#ephox-ui').getOrDie();

      var form = GuiFactory.build(
        SerialisedDialog.sketch({
          onExecute: function () { },
          getInitialValue: function () {
            return Option.some({
              alpha: {
                value: '10',
                text: 'Alpha'
              }
            });
          },
          fields: [
            Inputs.field('alpha', 'placeholder-alpha'),
            Inputs.field('beta', 'placeholder-beta'),
            Inputs.field('gamma', 'placeholder-gamma'),
            Inputs.field('delta', 'placeholder-delta')
          ]
        })
      );

      var gui = Gui.create();
      Insert.append(ephoxUi, gui.element());

      gui.add(form);
    };
  }
);