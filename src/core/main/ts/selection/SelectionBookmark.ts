import { Fun, Option } from '@ephox/katamari';
import { PlatformDetection } from '@ephox/sand';
import { Compare, Element, Node, Text, Traverse, Selection } from '@ephox/sugar';
import { document } from '@ephox/dom-globals';

const browser = PlatformDetection.detect().browser;

const clamp = function (offset, element) {
  const max = Node.isText(element) ? Text.get(element).length : Traverse.children(element).length + 1;

  if (offset > max) {
    return max;
  } else if (offset < 0) {
    return 0;
  }

  return offset;
};

const normalizeRng = function (rng) {
  return Selection.range(
    rng.start(),
    clamp(rng.soffset(), rng.start()),
    rng.finish(),
    clamp(rng.foffset(), rng.finish())
  );
};

const isOrContains = function (root, elm) {
  return Compare.contains(root, elm) || Compare.eq(root, elm);
};

const isRngInRoot = function (root) {
  return function (rng) {
    return isOrContains(root, rng.start()) && isOrContains(root, rng.finish());
  };
};

// var dumpRng = function (rng) {
//   console.log('start', rng.start().dom());
//   console.log('soffset', rng.soffset());
//   console.log('finish', rng.finish().dom());
//   console.log('foffset', rng.foffset());
//   return rng;
// };

const shouldStore = function (editor) {
  return editor.inline === true || browser.isIE();
};

const nativeRangeToSelectionRange = function (r) {
  return Selection.range(Element.fromDom(r.startContainer), r.startOffset, Element.fromDom(r.endContainer), r.endOffset);
};

const readRange = function (win) {
  const selection = win.getSelection();
  const rng = !selection || selection.rangeCount === 0 ? Option.none() : Option.from(selection.getRangeAt(0));
  return rng.map(nativeRangeToSelectionRange);
};

const getBookmark = function (root) {
  const win = Traverse.defaultView(root);

  return readRange(win.dom())
    .filter(isRngInRoot(root));
};

const validate = function (root, bookmark) {
  return Option.from(bookmark)
      .filter(isRngInRoot(root))
      .map(normalizeRng);
};

const bookmarkToNativeRng = function (bookmark) {
  const rng = document.createRange();

  try {
    // Might throw IndexSizeError
    rng.setStart(bookmark.start().dom(), bookmark.soffset());
    rng.setEnd(bookmark.finish().dom(), bookmark.foffset());
    return Option.some(rng);
  } catch (_) {
    return Option.none();
  }
};

const store = function (editor) {
  const newBookmark = shouldStore(editor) ? getBookmark(Element.fromDom(editor.getBody())) : Option.none();

  editor.bookmark = newBookmark.isSome() ? newBookmark : editor.bookmark;
};

const storeNative = function (editor, rng) {
  const root = Element.fromDom(editor.getBody());
  const range = shouldStore(editor) ? Option.from(rng) : Option.none();

  const newBookmark = range.map(nativeRangeToSelectionRange)
    .filter(isRngInRoot(root));

  editor.bookmark = newBookmark.isSome() ? newBookmark : editor.bookmark;
};

const getRng = function (editor) {
  const bookmark = editor.bookmark ? editor.bookmark : Option.none();

  return bookmark
    .bind(Fun.curry(validate, Element.fromDom(editor.getBody())))
    .bind(bookmarkToNativeRng);
};

const restore = function (editor) {
  getRng(editor).each(function (rng) {
    editor.selection.setRng(rng);
  });
};

export default {
  store,
  storeNative,
  readRange,
  restore,
  getRng,
  getBookmark,
  validate
};