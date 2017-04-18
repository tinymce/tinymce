test(
  'Test: phantom.bridge.LinkBridgeTest',

  [
    'ephox.agar.api.Logger',
    'ephox.agar.api.RawAssertions',
    'ephox.alloy.test.TestStore',
    'ephox.boulder.api.Objects',
    'ephox.katamari.api.Cell',
    'ephox.katamari.api.Fun',
    'ephox.sugar.api.node.Element',
    'tinymce.themes.mobile.bridge.LinkBridge'
  ],

  function (Logger, RawAssertions, TestStore, Objects, Cell, Fun, Element, LinkBridge) {
    var store = TestStore();

    var editorState = {
      start: Cell(null),
      content: Cell('')
    };

    var editor = {
      selection: {
        getStart: editorState.start.get,
        getContent: editorState.content.get,
        select: Fun.noop
      },
      insertContent: function (data) {
        store.adder({ method: 'insertContent', data: data })();
      },
      dom: {
        createHTML: function (tag, attributes, innerText) {
          return { tag: tag, attributes: attributes, innerText: innerText };
        },
        encode: Fun.identity
      },
      focus: Fun.noop
    };

    Logger.sync(
      'Checking getting info for just text node',
      function () {
        editorState.start.set(Element.fromText('hi').dom());
        editorState.content.set('');
        var info = LinkBridge.getInfo(editor);
        RawAssertions.assertEq('Checking getInfo', {
          text: ''
        }, Objects.narrow(info, [ 'url', 'text', 'target', 'title' ]));
        RawAssertions.assertEq('Checking link is not set', true, info.link.isNone());
      }
    );

  }
);
