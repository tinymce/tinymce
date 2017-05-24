define(
  'tinymce.themes.mobile.ui.CommonRealm',

  [
    'ephox.alloy.api.behaviour.Behaviour',
    'ephox.alloy.api.behaviour.Replacing',
    'ephox.alloy.api.component.GuiFactory',
    'ephox.alloy.api.ui.Button',
    'ephox.alloy.api.ui.Container',
    'tinymce.themes.mobile.util.UiDomFactory'
  ],

  function (Behaviour, Replacing, GuiFactory, Button, Container, UiDomFactory) {
    var makeEditSwitch = function (webapp) {
      return GuiFactory.build(
        Button.sketch({
          dom: UiDomFactory.dom('<div class="${prefix}-mask-edit-icon"></div>'),
          action: function () {
            webapp.run(function (w) {
              w.setReadOnly(false);
            });
          }
        })
      );
    };

    var makeSocket = function () {
      return GuiFactory.build(
        Container.sketch({
          dom: UiDomFactory.dom('<div class="${prefix}-editor-socket"></div>'),
          components: [ ],

          containerBehaviours: Behaviour.derive([
            Replacing.config({ })
          ])
        })
      );
    };

    var showEdit = function (socket, switchToEdit) {
      Replacing.append(socket, GuiFactory.premade(switchToEdit));
    };

    var hideEdit = function (socket, switchToEdit) {
      Replacing.remove(socket, switchToEdit);
    };

    var updateMode = function (socket, switchToEdit, readOnly) {
      var f = readOnly ? showEdit : hideEdit;
      f(socket, switchToEdit);
    };

    return {
      makeEditSwitch: makeEditSwitch,
      makeSocket: makeSocket,
      updateMode: updateMode
    };
  }
);
