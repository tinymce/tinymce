define(
  'tinymce.themes.mobile.ios.core.PlatformEditor',

  [
    'ephox.katamari.api.Fun',
    'ephox.katamari.api.Option',
    'ephox.sugar.api.events.DomEvent',
    'ephox.sugar.api.node.Element',
    'ephox.sugar.api.selection.WindowSelection'
  ],

  function (Fun, Option, DomEvent, Element, WindowSelection) {
    var getBodyFromFrame = function (frame) {
      return Option.some(Element.fromDom(frame.dom().contentWindow.document.body));
    };

    var getDocFromFrame = function (frame) {
      return Option.some(Element.fromDom(frame.dom().contentWindow.document));
    };

    var getWinFromFrame = function (frame) {
      return Option.from(frame.dom().contentWindow);
    };

    var getSelectionFromFrame = function (frame) {
      var optWin = getWinFromFrame(frame);
      return optWin.bind(WindowSelection.getExact);
    };

    var getFrame = function (editor) {
      return editor.getFrame();
    };

    var getOrDerive = function (name, f) {
      return function (editor) {
        var g = editor[name].getOrThunk(function () {
          var frame = getFrame(editor);
          return function () {
            return f(frame);
          };
        });

        return g();
      };
    };

    var getOrListen = function (editor, doc, name, type) {
      return editor[name].getOrThunk(function () {
        return function (handler) {
          return DomEvent.bind(doc, type, handler);
        };
      });
    };

    var getActiveApi = function (editor) {
      var frame = getFrame(editor);

      return getBodyFromFrame(frame).bind(function (body) {
        return getDocFromFrame(frame).bind(function (doc) {
          return getWinFromFrame(frame).map(function (win) {

            var html = Element.fromDom(doc.dom().documentElement);

            var getCursorBox = editor.getCursorBox.getOrThunk(function () {
              return function () {
                return WindowSelection.get(win).bind(function (sel) {
                  return WindowSelection.getFirstRect(win, sel);
                });
              };
            });

            var setSelection = editor.setSelection.getOrThunk(function () {
              return function (start, soffset, finish, foffset) {
                WindowSelection.setExact(win, start, soffset, finish, foffset);
              };
            });

            var clearSelection = editor.clearSelection.getOrThunk(function () {
              return function () {
                WindowSelection.clear(win);
              };
            });

            return {
              body: Fun.constant(body),
              doc: Fun.constant(doc),
              win: Fun.constant(win),
              html: Fun.constant(html),
              getSelection: Fun.curry(getSelectionFromFrame, frame),
              setSelection: setSelection,
              clearSelection: clearSelection,
              frame: Fun.constant(frame),

              onKeyup: getOrListen(editor, doc, 'onKeyup', 'keyup'),
              onNodeChanged: getOrListen(editor, doc, 'onNodeChanged', 'selectionchange'),
              onDomChanged: editor.onDomChanged, // consider defaulting with MutationObserver

              onScrollToCursor: editor.onScrollToCursor,
              onScrollToElement: editor.onScrollToElement,
              onToReading: editor.onToReading,
              onToEditing: editor.onToEditing,

              onToolbarScrollStart: editor.onToolbarScrollStart,
              onTapContent: editor.onTapContent,

              getCursorBox: getCursorBox
            };
          });
        });
      });
    };

    return {
      getBody: getOrDerive('getBody', getBodyFromFrame),
      getDoc: getOrDerive('getDoc', getDocFromFrame),
      getWin: getOrDerive('getWin', getWinFromFrame),
      getSelection: getOrDerive('getSelection', getSelectionFromFrame),
      getFrame: getFrame,
      getActiveApi: getActiveApi
    };
  }
);
