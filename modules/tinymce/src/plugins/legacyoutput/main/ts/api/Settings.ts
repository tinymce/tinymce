/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Editor from 'tinymce/core/api/Editor';

const getFontSizeFormats = (editor: Editor): string => {
  return editor.getParam('fontsize_formats');
};

const setFontSizeFormats = (editor: Editor, fontsize_formats: string) => {
  editor.settings.fontsize_formats = fontsize_formats;
};

const getFontFormats = (editor: Editor): string => {
  return editor.getParam('font_formats');
};

const setFontFormats = (editor: Editor, font_formats: string) => {
  editor.settings.font_formats = font_formats;
};

const getFontSizeStyleValues = (editor: Editor): string => {
  return editor.getParam('font_size_style_values', 'xx-small,x-small,small,medium,large,x-large,xx-large');
};

const setInlineStyles = (editor: Editor, inline_styles: boolean) => {
  editor.settings.inline_styles = inline_styles;
};

export default {
  getFontFormats,
  getFontSizeFormats,
  setFontSizeFormats,
  setFontFormats,
  getFontSizeStyleValues,
  setInlineStyles
};