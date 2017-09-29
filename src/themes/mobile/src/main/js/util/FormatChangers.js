define(
  'tinymce.themes.mobile.util.FormatChangers',

  [
    'ephox.katamari.api.Arr',
    'ephox.katamari.api.Fun',
    'ephox.katamari.api.Obj',
    'tinymce.themes.mobile.channels.TinyChannels'
  ],

  function (Arr, Fun, Obj, TinyChannels) {
    var fontSizes = [ 'x-small', 'small', 'medium', 'large', 'x-large' ];

    var fireChange = function (realm, command, state) {
      realm.system().broadcastOn([ TinyChannels.formatChanged() ], {
        command: command,
        state: state
      });
    };

    var init = function (realm, editor) {
      var allFormats = Obj.keys(editor.formatter.get());
      Arr.each(allFormats, function (command) {
        editor.formatter.formatChanged(command, function (state) {
          fireChange(realm, command, state);
        });
      });

      Arr.each([ 'ul', 'ol' ], function (command) {
        editor.selection.selectorChanged(command, function (state, data) {
          fireChange(realm, command, state);
        });
      });
    };

    return {
      init: init,
      fontSizes: Fun.constant(fontSizes)
    };
  }
);
