/**
 * Events.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2018 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

const fireWordCountUpdate = (editor, text) => {
  editor.fire('wordCountUpdate', {wordCountText: text});
};

export default {
  fireWordCountUpdate
};