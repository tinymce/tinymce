/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Editor from 'tinymce/core/api/Editor';
import DefaultStyleFormats from '../features/DefaultStyleFormats';

const defaults = [ 'undo', 'bold', 'italic', 'link', 'image', 'bullist', 'styleselect' ];

const isSkinDisabled = (editor: Editor): boolean => editor.getParam('skin') === false;

const readOnlyOnInit = (_editor: Editor) =>
  // Intentional short circuit because stub. Was meant to reference a setting for readonly on init in mobile theme
  false;

const getToolbar = (editor: Editor): string[] => editor.getParam('toolbar', defaults, 'array');

const getStyleFormats = (editor: Editor): any[] => editor.getParam('style_formats', DefaultStyleFormats, 'array');

const getSkinUrl = (editor: Editor) => editor.getParam('skin_url');

export {
  isSkinDisabled,
  readOnlyOnInit,
  getToolbar,
  getStyleFormats,
  getSkinUrl
};
