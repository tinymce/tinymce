define(
  'tinymce.themes.mobile.ui.CommonRealm',

  [
    'ephox.alloy.api.behaviour.Behaviour',
    'ephox.alloy.api.behaviour.Replacing',
    'ephox.alloy.api.component.GuiFactory',
    'ephox.alloy.api.ui.Button',
    'ephox.alloy.api.ui.Container',
    'tinymce.themes.mobile.style.Styles'
  ],

  function (Behaviour, Replacing, GuiFactory, Button, Container, Styles) {
    var makeEditSwitch = function (webapp) {
      return GuiFactory.build(
        Button.sketch({
          dom: {
            tag: 'div',
            classes: [ 'tinymce-mobile-mask-edit-icon' ]
          },
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
          dom: {
            classes: [ Styles.resolve('editor-socket') ]
          },
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
