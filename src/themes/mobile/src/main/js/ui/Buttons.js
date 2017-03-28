define(
  'tinymce.themes.mobile.ui.Buttons',

  [
    'ephox.alloy.api.behaviour.Toggling',
    'ephox.alloy.api.ui.Button',
    'ephox.boulder.api.Objects',
    'ephox.katamari.api.Merger',
    'tinymce.themes.mobile.channels.TinyChannels',
    'tinymce.themes.mobile.style.Styles'
  ],

  function (Toggling, Button, Objects, Merger, TinyChannels, Styles) {
    var forToolbarCommand = function (editor, command) {
      return forToolbar(command, function () {
        editor.execCommand(command);
      }, { });
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
          channels: Objects.wrapAll([
            {
              key: TinyChannels.refreshUi(),
              value: {
                onReceive: function (component, data) {
                  var state = editor.queryCommandState(command);
                  var f = state === true ? Toggling.on : Toggling.off;
                  f(component);
                }
              }
            }
          ])
        }
      };

      return forToolbar(command, function () {
        editor.execCommand(command);
      }, extraBehaviours);
    }


    var forToolbar = function (clazz, action, extraBehaviours) {
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
        )
      });
    };

    return {
      forToolbar: forToolbar,
      forToolbarCommand: forToolbarCommand,
      forToolbarStateCommand: forToolbarStateCommand
    };
  }
);