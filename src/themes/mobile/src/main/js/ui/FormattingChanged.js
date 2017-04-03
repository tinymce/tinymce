define(
  'tinymce.themes.mobile.ui.FormattingChanged',

  [
    'ephox.alloy.alien.EventRoot',
    'ephox.alloy.api.events.SystemEvents',
    'ephox.alloy.construct.EventHandler',
    'ephox.boulder.api.Objects'
  ],

  function (EventRoot, SystemEvents, EventHandler, Objects) {
    var onAttached = function (editor, command, setValue) {
      return Objects.wrap(
        SystemEvents.attachedToDom(),
        EventHandler.nu({
          run: function (component, simulatedEvent) {
            if (EventRoot.isSource(component, simulatedEvent)) {
              var binder = function () {
                editor.formatter.formatChanged(command, function (v) {
                  setValue(component, v);
                });
              };

              // FIX (from original tiny source [FormatControls] with fix tag)
              if (editor.formatter !== undefined) {
                binder();
              } else {
                editor.on('init', binder);
              }
            }
          }
        })
      );
    };

    return {
      onAttached: onAttached
    };
  }
);
