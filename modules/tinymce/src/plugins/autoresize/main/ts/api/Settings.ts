/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Editor from 'tinymce/core/api/Editor';

const getSetting = <T>(name: string, defaultValue?: T, type?: string) => (editor: Editor): T =>
  editor.getParam(name, defaultValue, type);

const getAutoResizeMinHeight = (editor: Editor): number => editor.getParam('min_height', editor.getElement().offsetHeight, 'number');

const getAutoResizeMaxHeight = getSetting('max_height', 0, 'number');

const getAutoResizeOverflowPadding = getSetting('autoresize_overflow_padding', 1, 'number');

const getAutoResizeBottomMargin = getSetting('autoresize_bottom_margin', 50, 'number');

const shouldAutoResizeOnInit = getSetting('autoresize_on_init', true, 'boolean');

export {
  getAutoResizeMinHeight,
  getAutoResizeMaxHeight,
  getAutoResizeOverflowPadding,
  getAutoResizeBottomMargin,
  shouldAutoResizeOnInit
};
