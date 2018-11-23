/**
 * Buttons.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */
import Dialog from './Dialog';
import { Editor } from 'tinymce/core/api/Editor';
import { EmojiDatabase } from '../core/EmojiDatabase';

const register = function (editor: Editor, database: EmojiDatabase): void {
  const onAction = () => Dialog.open(editor, database);

  editor.ui.registry.addButton('emoticons', {
    tooltip: 'Emoticons',
    icon: 'emoji',
    onAction
  });

  editor.ui.registry.addMenuItem('emoticons', {
    text: 'Emoticons...',
    icon: 'emoji',
    onAction
  });
};

export default {
  register
};