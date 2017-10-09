define(
  'tinymce.themes.mobile.ui.OuterContainer',

  [
    'ephox.alloy.api.behaviour.Behaviour',
    'ephox.alloy.api.behaviour.Swapping',
    'ephox.alloy.api.component.GuiFactory',
    'ephox.alloy.api.system.Gui',
    'ephox.alloy.api.ui.Container',
    'ephox.katamari.api.Fun',
    'tinymce.themes.mobile.style.Styles'
  ],

  function (Behaviour, Swapping, GuiFactory, Gui, Container, Fun, Styles) {
    var READ_ONLY_MODE_CLASS = Fun.constant(Styles.resolve('readonly-mode'));
    var EDIT_MODE_CLASS = Fun.constant(Styles.resolve('edit-mode'));

    return function (spec) {
      var root = GuiFactory.build(
        Container.sketch({
          dom: {
            classes: [ Styles.resolve('outer-container') ].concat(spec.classes)
          },

          containerBehaviours: Behaviour.derive([
            Swapping.config({
              alpha: READ_ONLY_MODE_CLASS(),
              omega: EDIT_MODE_CLASS()
            })
          ])
        })
      );

      return Gui.takeover(root);
    };
  }
);
