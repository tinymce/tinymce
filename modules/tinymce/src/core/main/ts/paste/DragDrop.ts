import { Arr, Cell, Obj, Type } from '@ephox/katamari';

import DOMUtils from '../api/dom/DOMUtils';
import RangeUtils from '../api/dom/RangeUtils';
import Editor from '../api/Editor';
import Schema from '../api/html/Schema';
import * as Options from '../api/Options';
import Delay from '../api/util/Delay';
import * as TransparentElements from '../content/TransparentElements';
import * as Clipboard from './Clipboard';
import * as InternalHtml from './InternalHtml';
import * as PasteUtils from './PasteUtils';

const getCaretRangeFromEvent = (editor: Editor, e: MouseEvent): Range | undefined =>
  // TODO: TINY-7075 Remove the "?? 0" here when agar passes valid client coords
  RangeUtils.getCaretRangeFromPoint(e.clientX ?? 0, e.clientY ?? 0, editor.getDoc());

const isPlainTextFileUrl = (content: Clipboard.ClipboardContents): boolean => {
  const plainTextContent = content['text/plain'];
  return plainTextContent ? plainTextContent.indexOf('file://') === 0 : false;
};

const setFocusedRange = (editor: Editor, rng: Range | undefined): void => {
  editor.focus();
  if (rng) {
    editor.selection.setRng(rng);
  }
};

const hasImage = (dataTransfer: DataTransfer): boolean =>
  Arr.exists(dataTransfer.files, (file) => /^image\//.test(file.type));

const isTransparentBlockDrop = (dom: DOMUtils, schema: Schema, target: Node, dropContent: Clipboard.ClipboardContents) => {
  const parentTransparent = dom.getParent(target, (node) => TransparentElements.isTransparentBlock(schema, node));
  if (parentTransparent && Obj.has(dropContent, 'text/html')) {
    const fragment = new DOMParser().parseFromString(dropContent['text/html'], 'text/html').body;
    return !Type.isNull(fragment.querySelector(parentTransparent.nodeName.toLowerCase()));
  } else {
    return false;
  }
};

const setup = (editor: Editor, draggingInternallyState: Cell<boolean>): void => {
  // Block all drag/drop events
  if (Options.shouldPasteBlockDrop(editor)) {
    editor.on('dragend dragover draggesture dragdrop drop drag', (e) => {
      e.preventDefault();
      e.stopPropagation();
    });
  }

  // Prevent users from dropping data images on Gecko
  if (!Options.shouldPasteDataImages(editor)) {
    editor.on('drop', (e) => {
      const dataTransfer = e.dataTransfer;

      if (dataTransfer && hasImage(dataTransfer)) {
        e.preventDefault();
      }
    });
  }

  editor.on('drop', (e) => {
    if (e.isDefaultPrevented()) {
      return;
    }

    const rng = getCaretRangeFromEvent(editor, e);
    if (Type.isNullable(rng)) {
      return;
    }

    const dropContent = Clipboard.getDataTransferItems(e.dataTransfer);
    const internal = Clipboard.hasContentType(dropContent, InternalHtml.internalHtmlMime());

    if ((!Clipboard.hasHtmlOrText(dropContent) || isPlainTextFileUrl(dropContent)) && Clipboard.pasteImageData(editor, e, rng)) {
      return;
    }

    const internalContent = dropContent[InternalHtml.internalHtmlMime()];
    const content = internalContent || dropContent['text/html'] || dropContent['text/plain'];
    const transparentElementDrop = isTransparentBlockDrop(editor.dom, editor.schema, rng.startContainer, dropContent);

    if (draggingInternallyState.get() && !transparentElementDrop) {
      return;
    }

    if (content) {
      e.preventDefault();

      // FF 45 doesn't paint a caret when dragging in text in due to focus call by execCommand
      Delay.setEditorTimeout(editor, () => {
        editor.undoManager.transact(() => {
          if (internalContent) {
            editor.execCommand('Delete');
          }

          setFocusedRange(editor, rng);

          const trimmedContent = PasteUtils.trimHtml(content);

          if (dropContent['text/html']) {
            Clipboard.pasteHtml(editor, trimmedContent, internal);
          } else {
            Clipboard.pasteText(editor, trimmedContent);
          }
        });
      });
    }
  });

  editor.on('dragstart', (_e) => {
    draggingInternallyState.set(true);
  });

  editor.on('dragover dragend', (e) => {
    if (Options.shouldPasteDataImages(editor) && !draggingInternallyState.get()) {
      e.preventDefault();
      setFocusedRange(editor, getCaretRangeFromEvent(editor, e));
    }

    if (e.type === 'dragend') {
      draggingInternallyState.set(false);
    }
  });
};

export {
  setup
};
