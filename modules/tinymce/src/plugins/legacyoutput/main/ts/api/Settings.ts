/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Editor from 'tinymce/core/api/Editor';

const getSetting = <T>(name: string, defaultValue?: T, type?: string) => (editor: Editor): T =>
  editor.getParam(name, defaultValue, type);

const getFontSizeFormats = getSetting<string>('fontsize_formats');

const setFontSizeFormats = (editor: Editor, fontsize_formats: string) => {
  editor.settings.fontsize_formats = fontsize_formats; // Changes settings used by other plugins or core, so can't be removed.
};

const getFontFormats = getSetting<string>('font_formats');

const setFontFormats = (editor: Editor, font_formats: string) => {
  editor.settings.font_formats = font_formats; // Changes settings used by other plugins or core, so can't be removed.
};

const getFontSizeStyleValues = getSetting<string>('font_size_style_values', 'xx-small,x-small,small,medium,large,x-large,xx-large');

const setInlineStyles = (editor: Editor, inline_styles: boolean) => {
  editor.settings.inline_styles = inline_styles; // Changes settings used by other plugins or core, so can't be removed.
};

export {
  getFontFormats,
  getFontSizeFormats,
  setFontSizeFormats,
  setFontFormats,
  getFontSizeStyleValues,
  setInlineStyles
};
