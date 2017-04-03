define(
  'tinymce.themes.mobile.ui.Buttons',

  [
    'ephox.alloy.api.behaviour.Toggling',
    'ephox.alloy.api.ui.Button',
    'ephox.katamari.api.Merger',
    'tinymce.themes.mobile.style.Styles',
    'tinymce.themes.mobile.ui.FormattingChanged'
  ],

  function (Toggling, Button, Merger, Styles, FormattingChanged) {
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
        }
      };

      var doToggle = function (button, state) {
        var f = state === true ? Toggling.on : Toggling.off;
        f(button);
      };

      var extraEvents = FormattingChanged.onAttached(editor, command, doToggle);
   
      return forToolbar(command, function () {
        editor.execCommand(command);
      }, extraBehaviours, extraEvents);
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