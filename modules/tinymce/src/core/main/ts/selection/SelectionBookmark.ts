import { Optional } from '@ephox/katamari';
import { Compare, SimRange, SimSelection, SugarElement, SugarNode, SugarText, Traverse } from '@ephox/sugar';

import Editor from '../api/Editor';
import Env from '../api/Env';
import * as NodeType from '../dom/NodeType';

const clamp = (offset: number, element: SugarElement<Node>): number => {
  const max = SugarNode.isText(element) ? SugarText.get(element).length : Traverse.children(element).length + 1;

  if (offset > max) {
    return max;
  } else if (offset < 0) {
    return 0;
  }

  return offset;
};

const normalizeRng = (rng: SimRange): SimRange =>
  SimSelection.range(
    rng.start,
    clamp(rng.soffset, rng.start),
    rng.finish,
    clamp(rng.foffset, rng.finish)
  );

const isOrContains = (root: SugarElement<Node>, elm: SugarElement<Node>): boolean =>
  !NodeType.isRestrictedNode(elm.dom) && (Compare.contains(root, elm) || Compare.eq(root, elm));

const isRngInRoot = (root: SugarElement<Node>) => (rng: SimRange): boolean =>
  isOrContains(root, rng.start) && isOrContains(root, rng.finish);

// TINY-9259: We need to store the selection on Firefox since if the editor is hidden the selection.getRng() api will not work as expected.
const shouldStore = (editor: Editor) => editor.inline || Env.browser.isFirefox();

const nativeRangeToSelectionRange = (r: Range): SimRange =>
  SimSelection.range(SugarElement.fromDom(r.startContainer), r.startOffset, SugarElement.fromDom(r.endContainer), r.endOffset);

const readRange = (win: Window): Optional<SimRange> => {
  const selection = win.getSelection();
  const rng = !selection || selection.rangeCount === 0 ? Optional.none() : Optional.from(selection.getRangeAt(0));
  return rng.map(nativeRangeToSelectionRange);
};

const getBookmark = (root: SugarElement<Node>): Optional<SimRange> => {
  const win = Traverse.defaultView(root);

  return readRange(win.dom)
    .filter(isRngInRoot(root));
};

const validate = (root: SugarElement<Node>, bookmark: SimRange): Optional<SimRange> =>
  Optional.from(bookmark)
    .filter(isRngInRoot(root))
    .map(normalizeRng);

const bookmarkToNativeRng = (bookmark: SimRange): Optional<Range> => {
  const rng = document.createRange();

  try {
    // Might throw IndexSizeError
    rng.setStart(bookmark.start.dom, bookmark.soffset);
    rng.setEnd(bookmark.finish.dom, bookmark.foffset);
    return Optional.some(rng);
  } catch (_) {
    return Optional.none();
  }
};

const store = (editor: Editor): void => {
  const newBookmark = shouldStore(editor) ? getBookmark(SugarElement.fromDom(editor.getBody())) : Optional.none<SimRange>();

  editor.bookmark = newBookmark.isSome() ? newBookmark : editor.bookmark;
};

const storeNative = (editor: Editor, rng: Range): void => {
  const root = SugarElement.fromDom(editor.getBody());
  const range = shouldStore(editor) ? Optional.from(rng) : Optional.none<Range>();

  const newBookmark = range.map(nativeRangeToSelectionRange)
    .filter(isRngInRoot(root));

  editor.bookmark = newBookmark.isSome() ? newBookmark : editor.bookmark;
};

const getRng = (editor: Editor): Optional<Range> => {
  const bookmark: Optional<SimRange> = editor.bookmark ? editor.bookmark : Optional.none();

  return bookmark
    .bind((x) => validate(SugarElement.fromDom(editor.getBody()), x))
    .bind(bookmarkToNativeRng);
};

const restore = (editor: Editor): void => {
  getRng(editor).each((rng) => editor.selection.setRng(rng));
};

export {
  store,
  storeNative,
  readRange,
  restore,
  getRng,
  getBookmark,
  validate
};
