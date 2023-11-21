import { Fun } from '@ephox/katamari';

import Editor from '../api/Editor';
import Env from '../api/Env';
import Delay from '../api/util/Delay';
import { EditorEvent } from '../api/util/EventDispatcher';
import * as InternalHtml from './InternalHtml';

interface SelectionContentData {
  readonly html: string;
  readonly text: string;
}

type DoneFn = () => void;
type FallbackFn = (html: string, done: DoneFn) => void;

const setHtml5Clipboard = (clipboardData: DataTransfer | null, html: string, text: string): boolean => {
  if (clipboardData) {
    try {
      clipboardData.clearData();
      clipboardData.setData('text/html', html);
      clipboardData.setData('text/plain', text);
      clipboardData.setData(InternalHtml.internalHtmlMime(), html);
      return true;
    } catch (e) {
      return false;
    }
  } else {
    return false;
  }
};

const setClipboardData = (evt: ClipboardEvent, data: SelectionContentData, fallback: FallbackFn, done: DoneFn): void => {
  if (setHtml5Clipboard(evt.clipboardData, data.html, data.text)) {
    evt.preventDefault();
    done();
  } else {
    fallback(data.html, done);
  }
};

const fallback = (editor: Editor): FallbackFn => (html, done) => {
  const { dom, selection } = editor;

  const outer = dom.create('div', { 'contenteditable': 'false', 'data-mce-bogus': 'all' });
  const inner = dom.create('div', { contenteditable: 'true' }, html);
  dom.setStyles(outer, {
    position: 'fixed',
    top: '0',
    left: '-3000px',
    width: '1000px',
    overflow: 'hidden'
  });
  outer.appendChild(inner);
  dom.add(editor.getBody(), outer);

  const range = selection.getRng();
  inner.focus();

  const offscreenRange = dom.createRng();
  offscreenRange.selectNodeContents(inner);
  selection.setRng(offscreenRange);

  Delay.setEditorTimeout(editor, () => {
    selection.setRng(range);
    dom.remove(outer);
    done();
  }, 0);
};

const getData = (editor: Editor): SelectionContentData => ({
  html: InternalHtml.mark(editor.selection.getContent({ contextual: true })),
  text: editor.selection.getContent({ format: 'text' })
});

const isTableSelection = (editor: Editor): boolean =>
  !!editor.dom.getParent(editor.selection.getStart(), 'td[data-mce-selected],th[data-mce-selected]', editor.getBody());

const hasSelectedContent = (editor: Editor): boolean =>
  !editor.selection.isCollapsed() || isTableSelection(editor);

const cut = (editor: Editor) => (evt: EditorEvent<ClipboardEvent>): void => {
  if (!evt.isDefaultPrevented() && hasSelectedContent(editor) && editor.selection.isEditable()) {
    setClipboardData(evt, getData(editor), fallback(editor), () => {
      if (Env.browser.isChromium() || Env.browser.isFirefox()) {
        const rng = editor.selection.getRng();
        // Chrome fails to execCommand from another execCommand with this message:
        // "We don't execute document.execCommand() this time, because it is called recursively.""
        // Firefox 82 now also won't run recursive commands, but it doesn't log an error
        Delay.setEditorTimeout(editor, () => { // detach
          // Restore the range before deleting, as Chrome on Android will
          // collapse the selection after a cut event has fired.
          editor.selection.setRng(rng);
          editor.execCommand('Delete');
        }, 0);
      } else {
        editor.execCommand('Delete');
      }
    });
  }
};

const copy = (editor: Editor) => (evt: EditorEvent<ClipboardEvent>): void => {
  if (!evt.isDefaultPrevented() && hasSelectedContent(editor)) {
    setClipboardData(evt, getData(editor), fallback(editor), Fun.noop);
  }
};

const register = (editor: Editor): void => {
  editor.on('cut', cut(editor));
  editor.on('copy', copy(editor));
};

export {
  register
};
