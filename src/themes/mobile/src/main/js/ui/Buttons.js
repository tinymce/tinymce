define(
  'tinymce.themes.mobile.ui.Buttons',

  [
    'ephox.alloy.api.behaviour.Toggling',
    'ephox.alloy.api.ui.Button',
    'ephox.boulder.api.Objects',
    'ephox.katamari.api.Merger',
    'tinymce.themes.mobile.channels.TinyChannels',
    'tinymce.themes.mobile.style.Styles',
    'tinymce.themes.mobile.ui.FormattingBehaviour'
  ],

  function (Toggling, Button, Objects, Merger, TinyChannels, Styles, FormattingBehaviour) {
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
        receiving: {
          channels: Objects.wrap(
            TinyChannels.formatChanged(),
            {
              onReceive: function (button, data) {
                if (data.command === command) {
                  var toggle = data.state ? Toggling.on : Toggling.off;
                  toggle(button);
                }
              }
            }
          )
        }
      };
   
      return forToolbar(command, function () {
        editor.execCommand(command);
      }, extraBehaviours, { }, [
        FormattingBehaviour  
      ]);
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