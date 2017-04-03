define(
  'tinymce.themes.mobile.util.FormatChangers',

  [
    'ephox.katamari.api.Arr',
    'ephox.katamari.api.Fun',
    'tinymce.core.fmt.FontInfo',
    'tinymce.themes.mobile.channels.TinyChannels'
  ],

  function (Arr, Fun, FontInfo, TinyChannels) {
    var fontSizes = [ 'x-small', 'small', 'medium', 'large', 'x-large' ];

    var fireChange = function (ios, command, state) {
      ios.system().broadcastOn([ TinyChannels.formatChanged() ], {
        command: command,
        state: state
      });
    };

    var getFontSize = function (editor) {
      var node = editor.selection.getStart();
      var px = FontInfo.getFontSize(editor.getBody(), node);
      var pt = FontInfo.toPt(px);

      return Arr.find(fontSizes, function (size) {
        return px === size || pt === size;
      }).getOr('medium');
    };

    var init = function (ios, editor) {
      Arr.each([ 'bold', 'italic' ], function (command) {
        editor.formatter.formatChanged(command, function (state) {
          fireChange(ios, command, state);
        });
      });
    };

    return {
      init: init,
      getFontSize: getFontSize,
      fontSizes: Fun.constant(fontSizes)
    };
  }
);
