import { Arr, Strings } from '@ephox/katamari';

import Editor from '../api/Editor';
import * as Options from '../api/Options';
import Tools from '../api/util/Tools';

/*
 * This module tries to be smart depending on what the user pastes if it looks like an url
 * it will make a link out of the current selection. If it's an image url that looks like
 * an image it will check if it's an image and insert it as an image.
 */

type PasteFn = (editor: Editor, html: string) => boolean;

const pasteHtml = (editor: Editor, html: string): boolean => {
  editor.insertContent(html, {
    merge: Options.shouldPasteMergeFormats(editor),
    paste: true
  });

  return true;
};

const isAbsoluteUrl = (url: string): boolean =>
  /^https?:\/\/[\w\-\/+=.,!;:&%@^~(){}?#]+$/i.test(url);

const isImageUrl = (editor: Editor, url: string): boolean => {
  return isAbsoluteUrl(url) && Arr.exists(Options.getAllowedImageFileTypes(editor), (type) =>
    Strings.endsWith(url.toLowerCase(), `.${type.toLowerCase()}`)
  );
};

const createImage = (editor: Editor, url: string, pasteHtmlFn: PasteFn): boolean => {
  editor.undoManager.extra(() => {
    pasteHtmlFn(editor, url);
  }, () => {
    editor.insertContent('<img src="' + url + '">');
  });

  return true;
};

const createLink = (editor: Editor, url: string, pasteHtmlFn: PasteFn): boolean => {
  editor.undoManager.extra(() => {
    pasteHtmlFn(editor, url);
  }, () => {
    editor.execCommand('mceInsertLink', false, url);
  });

  return true;
};

const linkSelection = (editor: Editor, html: string, pasteHtmlFn: PasteFn): boolean =>
  !editor.selection.isCollapsed() && isAbsoluteUrl(html) ? createLink(editor, html, pasteHtmlFn) : false;

const insertImage = (editor: Editor, html: string, pasteHtmlFn: PasteFn): boolean =>
  isImageUrl(editor, html) ? createImage(editor, html, pasteHtmlFn) : false;

const smartInsertContent = (editor: Editor, html: string): void => {
  Tools.each([
    linkSelection,
    insertImage,
    pasteHtml
  ], (action) => {
    return !action(editor, html, pasteHtml);
  });
};

const insertContent = (editor: Editor, html: string, pasteAsText: boolean): void => {
  if (pasteAsText || !Options.isSmartPasteEnabled(editor)) {
    pasteHtml(editor, html);
  } else {
    smartInsertContent(editor, html);
  }
};

export {
  isImageUrl,
  isAbsoluteUrl,
  insertContent
};
