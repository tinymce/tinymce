define(
  'tinymce.themes.mobile.ui.Buttons',

  [
    'ephox.alloy.alien.EventRoot',
    'ephox.alloy.api.behaviour.Toggling',
    'ephox.alloy.api.events.SystemEvents',
    'ephox.alloy.api.ui.Button',
    'ephox.alloy.construct.EventHandler',
    'ephox.boulder.api.Objects',
    'ephox.katamari.api.Merger',
    'tinymce.themes.mobile.style.Styles'
  ],

  function (EventRoot, Toggling, SystemEvents, Button, EventHandler, Objects, Merger, Styles) {
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

      var extraEvents = Objects.wrap(
        SystemEvents.attachedToDom(),
        EventHandler.nu({
          run: function (button, simulatedEvent) {
            var toggle = function (state) {
              var f = state === true ? Toggling.on : Toggling.off;
              f(button);
            };
            if (EventRoot.isSource(button, simulatedEvent)) {
              // FIX (from original tiny source [FormatControls] with fix tag)
              if (editor.formatter) {
                editor.formatter.formatChanged(command, toggle);
              } else {
                editor.on('init', function () {
                  editor.formatter.formatChanged(command, toggle);
                });
              }
            }
          }
        })
      );
   
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