/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Actions from '../core/Actions';

const register = function (editor) {
  editor.addCommand('ApplyUnorderedListStyle', function (ui, value) {
    Actions.applyListFormat(editor, 'UL', value['list-style-type']);
  });

  editor.addCommand('ApplyOrderedListStyle', function (ui, value) {
    Actions.applyListFormat(editor, 'OL', value['list-style-type']);
  });
};

export default {
  register
};