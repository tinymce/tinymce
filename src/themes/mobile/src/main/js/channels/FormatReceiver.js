define(
  'tinymce.themes.mobile.channels.FormatReceiver',

  [
    'ephox.boulder.api.Objects',
    'tinymce.themes.mobile.channels.TinyChannels'
  ],

  function (Objects, TinyChannels) {
    var setup = function (command, update) {
      console.log('command', command);
      return {
        channels: Objects.wrap(
          TinyChannels.formatChanged(),
          {
            onReceive: function (button, data) {
              console.log('here', data, command);
              if (data.command === command) update(button, data.state);
            }
          }
        )
      };
    };

    return {
      setup: setup
    };
  }
);
