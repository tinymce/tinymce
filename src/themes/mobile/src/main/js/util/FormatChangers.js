define(
  'tinymce.themes.mobile.util.FormatChangers',

  [
    'ephox.katamari.api.Arr',
    'ephox.katamari.api.Fun',
    'tinymce.themes.mobile.channels.TinyChannels'
  ],

  function (Arr, Fun, TinyChannels) {
    var fontSizes = [ 'x-small', 'small', 'medium', 'large', 'x-large' ];

    var fireChange = function (ios, command, state) {
      ios.system().broadcastOn([ TinyChannels.formatChanged() ], {
        command: command,
        state: state
      });
    };

    var init = function (ios, editor) {
      Arr.each([ 'bold', 'italic', 'h1' ], function (command) {
        editor.formatter.formatChanged(command, function (state) {
          console.log('changing', command, state);
          fireChange(ios, command, state);
        });
      });
    };

    return {
      init: init,
      fontSizes: Fun.constant(fontSizes)
    };
  }
);
