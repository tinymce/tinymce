/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import RangeUtils from 'tinymce/core/api/dom/RangeUtils';
import Delay from 'tinymce/core/api/util/Delay';
import Settings from '../api/Settings';
import InternalHtml from './InternalHtml';
import Utils from './Utils';
import { Editor } from 'tinymce/core/api/Editor';
import { Clipboard } from '../api/Clipboard';
import { MouseEvent, DataTransfer, Range } from '@ephox/dom-globals';

const getCaretRangeFromEvent = function (editor: Editor, e: MouseEvent) {
  return RangeUtils.getCaretRangeFromPoint(e.clientX, e.clientY, editor.getDoc());
};

const isPlainTextFileUrl = function (content: DataTransfer) {
  const plainTextContent = content['text/plain'];
  return plainTextContent ? plainTextContent.indexOf('file://') === 0 : false;
};

const setFocusedRange = function (editor: Editor, rng: Range) {
  editor.focus();
  editor.selection.setRng(rng);
};

const setup = function (editor: Editor, clipboard: Clipboard, draggingInternallyState) {
  // Block all drag/drop events
  if (Settings.shouldBlockDrop(editor)) {
    editor.on('dragend dragover draggesture dragdrop drop drag', function (e) {
      e.preventDefault();
      e.stopPropagation();
    });
  }

  // Prevent users from dropping data images on Gecko
  if (!Settings.shouldPasteDataImages(editor)) {
    editor.on('drop', function (e) {
      const dataTransfer = e.dataTransfer;

      if (dataTransfer && dataTransfer.files && dataTransfer.files.length > 0) {
        e.preventDefault();
      }
    });
  }

  editor.on('drop', function (e) {
    let dropContent, rng;

    rng = getCaretRangeFromEvent(editor, e);

    if (e.isDefaultPrevented() || draggingInternallyState.get()) {
      return;
    }

    dropContent = clipboard.getDataTransferItems(e.dataTransfer);
    const internal = clipboard.hasContentType(dropContent, InternalHtml.internalHtmlMime());

    if ((!clipboard.hasHtmlOrText(dropContent) || isPlainTextFileUrl(dropContent)) && clipboard.pasteImageData(e, rng)) {
      return;
    }

    if (rng && Settings.shouldFilterDrop(editor)) {
      let content = dropContent['mce-internal'] || dropContent['text/html'] || dropContent['text/plain'];

      if (content) {
        e.preventDefault();

        // FF 45 doesn't paint a caret when dragging in text in due to focus call by execCommand
        Delay.setEditorTimeout(editor, function () {
          editor.undoManager.transact(function () {
            if (dropContent['mce-internal']) {
              editor.execCommand('Delete');
            }

            setFocusedRange(editor, rng);

            content = Utils.trimHtml(content);

            if (!dropContent['text/html']) {
              clipboard.pasteText(content);
            } else {
              clipboard.pasteHtml(content, internal);
            }
          });
        });
      }
    }
  });

  editor.on('dragstart', function (e) {
    draggingInternallyState.set(true);
  });

  editor.on('dragover dragend', function (e) {
    if (Settings.shouldPasteDataImages(editor) && draggingInternallyState.get() === false) {
      e.preventDefault();
      setFocusedRange(editor, getCaretRangeFromEvent(editor, e));
    }

    if (e.type === 'dragend') {
      draggingInternallyState.set(false);
    }
  });
};

export default {
  setup
};