import { Fun, Option } from '@ephox/katamari';
import { Compare, DomEvent, Element, WindowSelection } from '@ephox/sugar';

const getBodyFromFrame = function (frame) {
  return Option.some(Element.fromDom(frame.dom().contentWindow.document.body));
};

const getDocFromFrame = function (frame) {
  return Option.some(Element.fromDom(frame.dom().contentWindow.document));
};

const getWinFromFrame = function (frame) {
  return Option.from(frame.dom().contentWindow);
};

const getSelectionFromFrame = function (frame) {
  const optWin = getWinFromFrame(frame);
  return optWin.bind(WindowSelection.getExact);
};

const getFrame = function (editor) {
  return editor.getFrame();
};

const getOrDerive = function (name, f) {
  return function (editor) {
    const g = editor[name].getOrThunk(function () {
      const frame = getFrame(editor);
      return function () {
        return f(frame);
      };
    });

    return g();
  };
};

const getOrListen = function (editor, doc, name, type) {
  return editor[name].getOrThunk(function () {
    return function (handler) {
      return DomEvent.bind(doc, type, handler);
    };
  });
};

const toRect = function (rect) {
  return {
    left: Fun.constant(rect.left),
    top: Fun.constant(rect.top),
    right: Fun.constant(rect.right),
    bottom: Fun.constant(rect.bottom),
    width: Fun.constant(rect.width),
    height: Fun.constant(rect.height)
  };
};

const getActiveApi = function (editor) {
  const frame = getFrame(editor);

  // Empty paragraphs can have no rectangle size, so let's just use the start container
  // if it is collapsed;
  const tryFallbackBox = function (win) {
    const isCollapsed = function (sel) {
      return Compare.eq(sel.start(), sel.finish()) && sel.soffset() === sel.foffset();
    };

    const toStartRect = function (sel) {
      const rect = sel.start().dom().getBoundingClientRect();
      return rect.width > 0 || rect.height > 0 ? Option.some(rect).map(toRect) : Option.none();
    };

    return WindowSelection.getExact(win).filter(isCollapsed).bind(toStartRect);
  };

  return getBodyFromFrame(frame).bind(function (body) {
    return getDocFromFrame(frame).bind(function (doc) {
      return getWinFromFrame(frame).map(function (win) {

        const html = Element.fromDom(doc.dom().documentElement);

        const getCursorBox = editor.getCursorBox.getOrThunk(function () {
          return function () {
            return WindowSelection.get(win).bind(function (sel) {
              return WindowSelection.getFirstRect(win, sel).orThunk(function () {
                return tryFallbackBox(win);
              });
            });
          };
        });

        const setSelection = editor.setSelection.getOrThunk(function () {
          return function (start, soffset, finish, foffset) {
            WindowSelection.setExact(win, start, soffset, finish, foffset);
          };
        });

        const clearSelection = editor.clearSelection.getOrThunk(function () {
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
          setSelection,
          clearSelection,
          frame: Fun.constant(frame),

          onKeyup: getOrListen(editor, doc, 'onKeyup', 'keyup'),
          onNodeChanged: getOrListen(editor, doc, 'onNodeChanged', 'selectionchange'),
          onDomChanged: editor.onDomChanged, // consider defaulting with MutationObserver

          onScrollToCursor: editor.onScrollToCursor,
          onScrollToElement: editor.onScrollToElement,
          onToReading: editor.onToReading,
          onToEditing: editor.onToEditing,

          onToolbarScrollStart: editor.onToolbarScrollStart,
          onTouchContent: editor.onTouchContent,
          onTapContent: editor.onTapContent,
          onTouchToolstrip: editor.onTouchToolstrip,

          getCursorBox
        };
      });
    });
  });
};

export default {
  getBody: getOrDerive('getBody', getBodyFromFrame),
  getDoc: getOrDerive('getDoc', getDocFromFrame),
  getWin: getOrDerive('getWin', getWinFromFrame),
  getSelection: getOrDerive('getSelection', getSelectionFromFrame),
  getFrame,
  getActiveApi
};