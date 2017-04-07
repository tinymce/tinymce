define(
  'tinymce.themes.mobile.util.FormatChangers',

  [
    'ephox.katamari.api.Arr',
    'ephox.katamari.api.Fun',
    'ephox.sugar.api.node.Element',
    'ephox.sugar.api.node.Node',
    'ephox.sugar.api.search.SelectorFind',
    'tinymce.themes.mobile.channels.TinyChannels'
  ],

  function (Arr, Fun, Element, Node, SelectorFind, TinyChannels) {
    var fontSizes = [ 'x-small', 'small', 'medium', 'large', 'x-large' ];

    var fireChange = function (ios, command, state) {
      ios.system().broadcastOn([ TinyChannels.formatChanged() ], {
        command: command,
        state: state
      });
    };

    var init = function (ios, editor) {
      Arr.each([ 'bold', 'italic', 'h1', 'h2', 'h3' ], function (command) {
        editor.formatter.formatChanged(command, function (state) {
          fireChange(ios, command, state);
        });
      });

      editor.on('nodeChange', function (e) {
        var elem = Element.fromDom(e.element);
        var messages = SelectorFind.closest(elem, 'ol,ul').fold(function () {
          return [
            { command: 'ol', state: false },
            { command: 'ul', state: false }
          ];
        }, function (list) {
          return [
            { command: 'ol', state: Node.name(list) === 'ol' },
            { command: 'ul', state: Node.name(list) === 'ul' }
          ];
        });

        Arr.each(messages, function (message) {
          ios.system().broadcastOn([ TinyChannels.formatChanged() ], message);
        });
      });
    };

    return {
      init: init,
      fontSizes: Fun.constant(fontSizes)
    };
  }
);
