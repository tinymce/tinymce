define(
  'tinymce.themes.mobile.ui.Buttons',

  [
    'ephox.alloy.api.behaviour.Behaviour',
    'ephox.alloy.api.behaviour.Receiving',
    'ephox.alloy.api.behaviour.Toggling',
    'ephox.alloy.api.behaviour.Unselecting',
    'ephox.alloy.api.ui.Button',
    'ephox.katamari.api.Merger',
    'tinymce.themes.mobile.channels.FormatReceiver',
    'tinymce.themes.mobile.style.Styles'
  ],

  function (Behaviour, Receiving, Toggling, Unselecting, Button, Merger, FormatReceiver, Styles) {
    var forToolbarCommand = function (editor, command) {
      return forToolbar(command, function () {
        editor.execCommand(command);
      }, { });
    };

    var getToggleBehaviours = function (command) {
      return Behaviour.derive([
        Toggling.config({
          toggleClass: Styles.resolve('toolbar-button-selected'),
          toggleOnExecute: false,
          aria: {
            mode: 'pressed'
          }
        }),
        Receiving.config(
          FormatReceiver.setup(command, function (button, status) {
            var toggle = status ? Toggling.on : Toggling.off;
            toggle(button);
          })
        )
      ]);
    }

    var forToolbarStateCommand = function (editor, command) {
      var extraBehaviours = getToggleBehaviours(command);

      return forToolbar(command, function () {
        editor.execCommand(command);
      }, extraBehaviours);
    };

    // The action is not just executing the same command
    var forToolbarStateAction = function (editor, clazz, command, action) {
      var extraBehaviours = getToggleBehaviours(command);
      return forToolbar(clazz, action, extraBehaviours);
    };

    var forToolbar = function (clazz, action, extraBehaviours) {
      return Button.sketch({
        dom: {
          tag: 'span',
          classes: [ Styles.resolve('toolbar-button'), Styles.resolve('icon-' + clazz), Styles.resolve('icon') ]
        },
        action: action,

        buttonBehaviours: Merger.deepMerge(
          Behaviour.derive([
            Unselecting.config({ })
          ]),
          extraBehaviours
        )
      });
    };

    return {
      forToolbar: forToolbar,
      forToolbarCommand: forToolbarCommand,
      forToolbarStateAction: forToolbarStateAction,
      forToolbarStateCommand: forToolbarStateCommand
    };
  }
);