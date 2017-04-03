define(
  'tinymce.themes.mobile.ui.Buttons',

  [
    'ephox.alloy.api.behaviour.Toggling',
    'ephox.alloy.api.ui.Button',
    'ephox.katamari.api.Merger',
    'tinymce.themes.mobile.channels.FormatReceiver',
    'tinymce.themes.mobile.style.Styles'
  ],

  function (Toggling, Button, Merger, FormatReceiver, Styles) {
    var forToolbarCommand = function (editor, command) {
      return forToolbar(command, function () {
        editor.execCommand(command);
      }, { }, { });
    };

    var forToolbarStateCommand = function (editor, command) {
      var extraBehaviours = {
        toggling: {
          toggleClass: Styles.resolve('toolbar-button-selected'),
          toggleOnExecute: false,
          aria: {
            mode: 'pressed'
          }
        },
        receiving: FormatReceiver.setup(command, function (button, status) {
          var toggle = status ? Toggling.on : Toggling.off;
          toggle(button);
        })
      };
   
      return forToolbar(command, function () {
        editor.execCommand(command);
      }, extraBehaviours, { });
    }


    var forToolbar = function (clazz, action, extraBehaviours, extraEvents) {
      return Button.sketch({
        dom: {
          tag: 'span',
          classes: [ Styles.resolve('toolbar-button'), Styles.resolve('toolbar-button-' + clazz) ]
        },
        action: action,

        behaviours: Merger.deepMerge(
          {
            unselecting: true
          },
          extraBehaviours
        ),

        events: extraEvents
      });
    };

    return {
      forToolbar: forToolbar,
      forToolbarCommand: forToolbarCommand,
      forToolbarStateCommand: forToolbarStateCommand
    };
  }
);