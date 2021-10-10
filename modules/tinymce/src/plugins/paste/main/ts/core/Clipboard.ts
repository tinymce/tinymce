/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Arr, Cell, Singleton, Strings, Type } from '@ephox/katamari';

import Editor from 'tinymce/core/api/Editor';
import Env from 'tinymce/core/api/Env';
import { BlobInfo } from 'tinymce/core/api/file/BlobCache';
import { ParserArgs } from 'tinymce/core/api/html/DomParser';
import AstNode from 'tinymce/core/api/html/Node';
import Delay from 'tinymce/core/api/util/Delay';
import { EditorEvent } from 'tinymce/core/api/util/EventDispatcher';
import Promise from 'tinymce/core/api/util/Promise';
import VK from 'tinymce/core/api/util/VK';

import * as Events from '../api/Events';
import * as Settings from '../api/Settings';
import * as InternalHtml from './InternalHtml';
import * as Newlines from './Newlines';
import { PasteBin } from './PasteBin';
import * as ProcessFilters from './ProcessFilters';
import * as SmartPaste from './SmartPaste';
import * as Utils from './Utils';
import * as Whitespace from './Whitespace';

declare let window: any;

interface FileResult {
  readonly blob: File;
  readonly uri: string;
}

interface DataUriResult {
  readonly type: string | null;
  readonly data: string | null;
}

export interface ClipboardContents {
  [key: string]: string;
}

const doPaste = (editor: Editor, content: string, internal: boolean, pasteAsText: boolean): void => {
  const args = ProcessFilters.process(editor, content, internal);

  if (args.cancelled === false) {
    SmartPaste.insertContent(editor, args.content, pasteAsText);
  }
};

/**
 * Pastes the specified HTML. This means that the HTML is filtered and then
 * inserted at the current selection in the editor. It will also fire paste events
 * for custom user filtering.
 *
 * @param {String} html HTML code to paste into the current selection.
 * @param {Boolean?} internalFlag Optional true/false flag if the contents is internal or external.
 */
const pasteHtml = (editor: Editor, html: string, internalFlag: boolean): void => {
  const internal = internalFlag ? internalFlag : InternalHtml.isMarked(html);
  doPaste(editor, InternalHtml.unmark(html), internal, false);
};

/**
 * Pastes the specified text. This means that the plain text is processed
 * and converted into BR and P elements. It will fire paste events for custom filtering.
 *
 * @param {String} text Text to paste as the current selection location.
 */
const pasteText = (editor: Editor, text: string): void => {
  const encodedText = editor.dom.encode(text).replace(/\r\n/g, '\n');
  const normalizedText = Whitespace.normalizeWhitespace(editor, encodedText);
  const html = Newlines.convert(normalizedText, Settings.getForcedRootBlock(editor), Settings.getForcedRootBlockAttrs(editor));
  doPaste(editor, html, false, true);
};

/**
 * Gets various content types out of a datatransfer object.
 *
 * @param {DataTransfer} dataTransfer Event fired on paste.
 * @return {Object} Object with mime types and data for those mime types.
 */
const getDataTransferItems = (dataTransfer: DataTransfer | undefined): ClipboardContents => {
  const items: ClipboardContents = {};
  const mceInternalUrlPrefix = 'data:text/mce-internal,';

  if (dataTransfer) {
    // Use old WebKit/IE API
    if (dataTransfer.getData) {
      const legacyText = dataTransfer.getData('Text');
      if (legacyText && legacyText.length > 0) {
        if (legacyText.indexOf(mceInternalUrlPrefix) === -1) {
          items['text/plain'] = legacyText;
        }
      }
    }

    if (dataTransfer.types) {
      for (let i = 0; i < dataTransfer.types.length; i++) {
        const contentType = dataTransfer.types[i];
        try { // IE11 throws exception when contentType is Files (type is present but data cannot be retrieved via getData())
          items[contentType] = dataTransfer.getData(contentType);
        } catch (ex) {
          items[contentType] = ''; // useless in general, but for consistency across browsers
        }
      }
    }
  }

  return items;
};

/**
 * Gets various content types out of the Clipboard API. It will also get the
 * plain text using older IE and WebKit API:s.
 *
 * @param {ClipboardEvent} clipboardEvent Event fired on paste.
 * @return {Object} Object with mime types and data for those mime types.
 */
const getClipboardContent = (editor: Editor, clipboardEvent: ClipboardEvent): ClipboardContents =>
  getDataTransferItems(clipboardEvent.clipboardData || (editor.getDoc() as any).dataTransfer);

const hasContentType = (clipboardContent: ClipboardContents, mimeType: string): boolean =>
  mimeType in clipboardContent && clipboardContent[mimeType].length > 0;

const hasHtmlOrText = (content: ClipboardContents): boolean =>
  hasContentType(content, 'text/html') || hasContentType(content, 'text/plain');

const parseDataUri = (uri: string): DataUriResult => {
  const matches = /data:([^;]+);base64,([a-z0-9\+\/=]+)/i.exec(uri);
  if (matches) {
    return { type: matches[1], data: decodeURIComponent(matches[2]) };
  } else {
    return { type: null, data: null };
  }
};

const isValidDataUriImage = (editor: Editor, imgElm: HTMLImageElement): boolean => {
  const filter = Settings.getImagesDataImgFilter(editor);
  return filter ? filter(imgElm) : true;
};

const extractFilename = (editor: Editor, str: string): string | null => {
  const m = str.match(/([\s\S]+?)(?:\.[a-z0-9.]+)$/i);
  return Type.isNonNullable(m) ? editor.dom.encode(m[1]) : null;
};

const uniqueId = Utils.createIdGenerator('mceclip');

const pasteImage = (editor: Editor, imageItem: FileResult): void => {
  const { data: base64, type } = parseDataUri(imageItem.uri);
  const id = uniqueId();
  const file = imageItem.blob;
  const img = new Image();

  img.src = imageItem.uri;

  // TODO: Move the bulk of the cache logic to EditorUpload
  if (isValidDataUriImage(editor, img)) {
    const blobCache = editor.editorUpload.blobCache;
    let blobInfo: BlobInfo;

    const existingBlobInfo = blobCache.getByData(base64, type);
    if (!existingBlobInfo) {
      const useFileName = Settings.getImagesReuseFilename(editor) && Type.isNonNullable(file.name);
      const name = useFileName ? extractFilename(editor, file.name) : id;
      const filename = useFileName ? file.name : undefined;

      blobInfo = blobCache.create(id, file, base64, name, filename);
      blobCache.add(blobInfo);
    } else {
      blobInfo = existingBlobInfo;
    }

    pasteHtml(editor, '<img src="' + blobInfo.blobUri() + '">', false);
  } else {
    pasteHtml(editor, '<img src="' + imageItem.uri + '">', false);
  }
};

const isClipboardEvent = (event: Event): event is ClipboardEvent => event.type === 'paste';

const isDataTransferItem = (item: DataTransferItem | File): item is DataTransferItem =>
  // eslint-disable-next-line @typescript-eslint/unbound-method
  Type.isNonNullable((item as DataTransferItem).getAsFile);

const readFilesAsDataUris = (items: Array<File | DataTransferItem>) =>
  Promise.all(Arr.map(items, (item) => new Promise<FileResult>((resolve) => {
    const blob = isDataTransferItem(item) ? item.getAsFile() : item;

    const reader = new window.FileReader();
    reader.onload = () => {
      resolve({
        blob,
        uri: reader.result
      });
    };
    reader.readAsDataURL(blob);
  })));

const isImage = (editor: Editor) => {
  const allowedExtensions = Settings.getAllowedImageFileTypes(editor);
  return (file: File): boolean => Strings.startsWith(file.type, 'image/') && Arr.exists(allowedExtensions, (extension) => {
    return Utils.getImageMimeType(extension) === file.type;
  });
};

const getImagesFromDataTransfer = (editor: Editor, dataTransfer: DataTransfer): File[] => {
  const items = dataTransfer.items ? Arr.bind(Arr.from(dataTransfer.items), (item) => {
    return item.kind === 'file' ? [ item.getAsFile() ] : [];
  }) : [];
  const files = dataTransfer.files ? Arr.from(dataTransfer.files) : [];
  return Arr.filter(items.length > 0 ? items : files, isImage(editor));
};

/**
 * Checks if the clipboard contains image data if it does it will take that data
 * and convert it into a data url image and paste that image at the caret location.
 *
 * @param  {ClipboardEvent} e Paste/drop event object.
 * @param  {DOMRange} rng Rng object to move selection to.
 * @return {Boolean} true/false if the image data was found or not.
 */
const pasteImageData = (editor: Editor, e: ClipboardEvent | DragEvent, rng: Range): boolean => {
  const dataTransfer = isClipboardEvent(e) ? e.clipboardData : e.dataTransfer;

  if (Settings.getPasteDataImages(editor) && dataTransfer) {
    const images = getImagesFromDataTransfer(editor, dataTransfer);

    if (images.length > 0) {
      e.preventDefault();

      readFilesAsDataUris(images).then((fileResults) => {
        if (rng) {
          editor.selection.setRng(rng);
        }

        Arr.each(fileResults, (result) => {
          pasteImage(editor, result);
        });
      });

      return true;
    }
  }

  return false;
};

/**
 * Chrome on Android doesn't support proper clipboard access so we have no choice but to allow the browser default behavior.
 *
 * @param {Event} e Paste event object to check if it contains any data.
 * @return {Boolean} true/false if the clipboard is empty or not.
 */
const isBrokenAndroidClipboardEvent = (e: ClipboardEvent): boolean => {
  const clipboardData = e.clipboardData;

  return navigator.userAgent.indexOf('Android') !== -1 && clipboardData && clipboardData.items && clipboardData.items.length === 0;
};

const isKeyboardPasteEvent = (e: KeyboardEvent): boolean =>
  (VK.metaKeyPressed(e) && e.keyCode === 86) || (e.shiftKey && e.keyCode === 45);

const registerEventHandlers = (editor: Editor, pasteBin: PasteBin, pasteFormat: Cell<string>): void => {
  const keyboardPasteEvent = Singleton.value();
  const keyboardPastePressed = Singleton.value();
  let keyboardPastePlainTextState: boolean;

  editor.on('keyup', keyboardPastePressed.clear);

  editor.on('keydown', (e) => {
    const removePasteBinOnKeyUp = (e: EditorEvent<KeyboardEvent>) => {
      // Ctrl+V or Shift+Insert
      if (isKeyboardPasteEvent(e) && !e.isDefaultPrevented()) {
        pasteBin.remove();
      }
    };

    // Ctrl+V or Shift+Insert
    if (isKeyboardPasteEvent(e) && !e.isDefaultPrevented()) {
      keyboardPastePlainTextState = e.shiftKey && e.keyCode === 86;

      // Edge case on Safari on Mac where it doesn't handle Cmd+Shift+V correctly
      // it fires the keydown but no paste or keyup so we are left with a paste bin
      if (keyboardPastePlainTextState && Env.webkit && navigator.userAgent.indexOf('Version/') !== -1) {
        return;
      }

      // Prevent undoManager keydown handler from making an undo level with the pastebin in it
      e.stopImmediatePropagation();

      // track that this is a keyboard paste event, this will be removed when the paste event fires.
      keyboardPasteEvent.set(e);
      // IE doesn't always fire keydown if the keys are spammed fast enough, so register that paste is
      // pressed, this will be removed on keyup
      keyboardPastePressed.set(true);

      // IE doesn't support Ctrl+Shift+V and it doesn't even produce a paste event
      // so lets fake a paste event and let IE use the execCommand/dataTransfer methods
      if (Env.ie && keyboardPastePlainTextState) {
        e.preventDefault();
        Events.firePaste(editor, true);
        return;
      }

      pasteBin.remove();
      pasteBin.create();

      // Remove pastebin if we get a keyup and no paste event
      // For example pasting a file in IE 11 will not produce a paste event
      editor.once('keyup', removePasteBinOnKeyUp);
      editor.once('paste', () => {
        editor.off('keyup', removePasteBinOnKeyUp);
      });
    }
  });

  const insertClipboardContent = (editor: Editor, clipboardContent: ClipboardContents, isKeyBoardPaste: boolean, plainTextMode: boolean, internal: boolean): void => {
    let content: string;

    // Grab HTML from Clipboard API or paste bin as a fallback
    if (hasContentType(clipboardContent, 'text/html')) {
      content = clipboardContent['text/html'];
    } else {
      content = pasteBin.getHtml();
      internal = internal ? internal : InternalHtml.isMarked(content);

      // If paste bin is empty try using plain text mode
      // since that is better than nothing right
      if (pasteBin.isDefaultContent(content)) {
        plainTextMode = true;
      }
    }

    content = Utils.trimHtml(content);

    pasteBin.remove();

    const isPlainTextHtml = (internal === false && Newlines.isPlainText(content));
    const isAbsoluteUrl = SmartPaste.isAbsoluteUrl(content);

    // If we got nothing from clipboard API and pastebin or the content is a plain text (with only
    // some BRs, Ps or DIVs as newlines) then we fallback to plain/text
    if (!content.length || (isPlainTextHtml && !isAbsoluteUrl)) {
      plainTextMode = true;
    }

    // Grab plain text from Clipboard API or convert existing HTML to plain text
    if (plainTextMode || isAbsoluteUrl) {
      // Use plain text contents from Clipboard API unless the HTML contains paragraphs then
      // we should convert the HTML to plain text since works better when pasting HTML/Word contents as plain text
      if (hasContentType(clipboardContent, 'text/plain') && isPlainTextHtml) {
        content = clipboardContent['text/plain'];
      } else {
        content = Utils.innerText(content);
      }
    }

    // If the content is the paste bin default HTML then it was
    // impossible to get the clipboard data out.
    if (pasteBin.isDefaultContent(content)) {
      if (!isKeyBoardPaste) {
        editor.windowManager.alert('Please use Ctrl+V/Cmd+V keyboard shortcuts to paste contents.');
      }

      return;
    }

    if (plainTextMode) {
      pasteText(editor, content);
    } else {
      pasteHtml(editor, content, internal);
    }
  };

  const getLastRng = (): Range => {
    return pasteBin.getLastRng() || editor.selection.getRng();
  };

  editor.on('paste', (e: EditorEvent<ClipboardEvent & { ieFake: boolean }>) => {
    const isKeyboardPaste = keyboardPasteEvent.isSet() || keyboardPastePressed.isSet();
    if (isKeyboardPaste) {
      keyboardPasteEvent.clear();
    }
    const clipboardContent = getClipboardContent(editor, e);

    const plainTextMode = pasteFormat.get() === 'text' || keyboardPastePlainTextState;
    let internal = hasContentType(clipboardContent, InternalHtml.internalHtmlMime());

    keyboardPastePlainTextState = false;

    if (e.isDefaultPrevented() || isBrokenAndroidClipboardEvent(e)) {
      pasteBin.remove();
      return;
    }

    if (!hasHtmlOrText(clipboardContent) && pasteImageData(editor, e, getLastRng())) {
      pasteBin.remove();
      return;
    }

    // Not a keyboard paste prevent default paste and try to grab the clipboard contents using different APIs
    if (!isKeyboardPaste) {
      e.preventDefault();
    }

    // Try IE only method if paste isn't a keyboard paste
    if (Env.ie && (!isKeyboardPaste || e.ieFake) && !hasContentType(clipboardContent, 'text/html')) {
      pasteBin.create();

      editor.dom.bind(pasteBin.getEl(), 'paste', (e) => {
        e.stopPropagation();
      });

      editor.getDoc().execCommand('Paste', false, null);
      clipboardContent['text/html'] = pasteBin.getHtml();
    }

    // If clipboard API has HTML then use that directly
    if (hasContentType(clipboardContent, 'text/html')) {
      e.preventDefault();

      // if clipboard lacks internal mime type, inspect html for internal markings
      if (!internal) {
        internal = InternalHtml.isMarked(clipboardContent['text/html']);
      }

      insertClipboardContent(editor, clipboardContent, isKeyboardPaste, plainTextMode, internal);
    } else {
      Delay.setEditorTimeout(editor, () => {
        insertClipboardContent(editor, clipboardContent, isKeyboardPaste, plainTextMode, internal);
      }, 0);
    }
  });
};

/**
 * This class contains logic for getting HTML contents out of the clipboard.
 *
 * We need to make a lot of ugly hacks to get the contents out of the clipboard since
 * the W3C Clipboard API is broken in all browsers that have it: Gecko/WebKit/Blink.
 * We might rewrite this the way those API:s stabilize. Browsers doesn't handle pasting
 * from applications like Word the same way as it does when pasting into a contentEditable area
 * so we need to do lots of extra work to try to get to this clipboard data.
 *
 * Current implementation steps:
 *  1. On keydown with paste keys Ctrl+V or Shift+Insert create
 *     a paste bin element and move focus to that element.
 *  2. Wait for the browser to fire a "paste" event and get the contents out of the paste bin.
 *  3. Check if the paste was successful if true, process the HTML.
 *  (4). If the paste was unsuccessful use IE execCommand, Clipboard API, document.dataTransfer old WebKit API etc.
 *
 * @class tinymce.pasteplugin.Clipboard
 * @private
 */

const registerEventsAndFilters = (editor: Editor, pasteBin: PasteBin, pasteFormat: Cell<string>): void => {
  registerEventHandlers(editor, pasteBin, pasteFormat);
  let src: string | undefined;

  // Remove all data images from paste for example from Gecko
  // except internal images like video elements
  editor.parser.addNodeFilter('img', (nodes, name, args) => {
    const isPasteInsert = (args: ParserArgs): boolean => args.data && args.data.paste === true;

    const remove = (node: AstNode): void => {
      if (!node.attr('data-mce-object') && src !== Env.transparentSrc) {
        node.remove();
      }
    };

    const isWebKitFakeUrl = (src: string): boolean => src.indexOf('webkit-fake-url') === 0;

    const isDataUri = (src: string): boolean => src.indexOf('data:') === 0;

    if (!Settings.getPasteDataImages(editor) && isPasteInsert(args)) {
      let i = nodes.length;

      while (i--) {
        src = nodes[i].attr('src');

        if (!src) {
          continue;
        }

        // Safari on Mac produces webkit-fake-url see: https://bugs.webkit.org/show_bug.cgi?id=49141
        if (isWebKitFakeUrl(src)) {
          remove(nodes[i]);
        } else if (!Settings.getAllowHtmlDataUrls(editor) && isDataUri(src)) {
          remove(nodes[i]);
        }
      }
    }
  });
};

export {
  registerEventsAndFilters,
  pasteHtml,
  pasteText,
  pasteImageData,
  getDataTransferItems,
  hasHtmlOrText,
  hasContentType
};
