define(
  'tinymce.themes.mobile.ui.Buttons',

  [
    'ephox.alloy.api.behaviour.Toggling',
    'ephox.alloy.api.ui.Button',
    'ephox.katamari.api.Merger',
    'tinymce.themes.mobile.style.Styles',
    'tinymce.themes.mobile.ui.FormattingBehaviour'
  ],

  function (Toggling, Button, Merger, Styles, FormattingBehaviour) {
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
        'tiny-formatting': {
          editor: editor,
          command: command,
          update: function (button, state) {
            var f = state === true ? Toggling.on : Toggling.off;
            f(button);
          }
        }
      };
   
      return forToolbar(command, function () {
        editor.execCommand(command);
      }, extraBehaviours, { }, [
        FormattingBehaviour  
      ]);
    }


    var forToolbar = function (clazz, action, extraBehaviours, extraEvents, _customBehaviours) {
      var customBehaviours = _customBehaviours !== undefined ? _customBehaviours : [ ];
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

        events: extraEvents,
        customBehaviours: customBehaviours
      });
    };

    return {
      forToolbar: forToolbar,
      forToolbarCommand: forToolbarCommand,
      forToolbarStateCommand: forToolbarStateCommand
    };
  }
);