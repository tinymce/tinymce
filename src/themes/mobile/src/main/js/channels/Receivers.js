define(
  'tinymce.themes.mobile.channels.Receivers',

  [
    'ephox.alloy.api.behaviour.Receiving',
    'ephox.boulder.api.Objects',
    'tinymce.themes.mobile.channels.TinyChannels'
  ],

  function (Receiving, Objects, TinyChannels) {
    var format = function (command, update) {
      return Receiving.config({
        channels: Objects.wrap(
          TinyChannels.formatChanged(),
          {
            onReceive: function (button, data) {
              if (data.command === command) {
                update(button, data.state);
              }
            }
          }
        )
      });
    };

    var orientation = function (onReceive) {
      return Receiving.config({
        channels: Objects.wrap(
          TinyChannels.orientationChanged(),
          {
            onReceive: onReceive
          }
        )
      });
    };

    var receive = function (channel, onReceive) {
      return {
        key: channel,
        value: {
          onReceive: onReceive
        }
      };
    };

    return {
      format: format,
      orientation: orientation,
      receive: receive
    };
  }
);
