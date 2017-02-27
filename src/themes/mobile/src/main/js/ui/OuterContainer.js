define(
  'tinymce.themes.mobile.ui.OuterContainer',

  [
    'ephox.alloy.api.component.GuiFactory',
    'ephox.alloy.api.system.Gui',
    'ephox.alloy.api.ui.Container'
  ],

  function (GuiFactory, Gui, Container) {
    return function () {
      var root = GuiFactory.build(
        Container.sketch({
          dom: {
            classes: [ 'mce-tinymce', 'mce-container', 'mce-panel' ]
          }
        })
      );

      return Gui.takeover(root);
    };
  }
);
