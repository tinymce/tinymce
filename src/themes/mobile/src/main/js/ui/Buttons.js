define(
  'tinymce.themes.mobile.ui.Buttons',

  [
    'ephox.alloy.api.behaviour.Behaviour',
    'ephox.alloy.api.behaviour.Toggling',
    'ephox.alloy.api.behaviour.Unselecting',
    'ephox.alloy.api.ui.Button',
    'ephox.katamari.api.Merger',
    'tinymce.themes.mobile.channels.Receivers',
    'tinymce.themes.mobile.style.Styles',
    'tinymce.themes.mobile.util.UiDomFactory'
  ],

  function (Behaviour, Toggling, Unselecting, Button, Merger, Receivers, Styles, UiDomFactory) {
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
        Receivers.format(command, function (button, status) {
          var toggle = status ? Toggling.on : Toggling.off;
          toggle(button);
        })
      ]);
    };

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
        dom: UiDomFactory.dom('<span class="${prefix}-toolbar-button ${prefix}-icon-' + clazz + ' ${prefix}-icon"></span>'),
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