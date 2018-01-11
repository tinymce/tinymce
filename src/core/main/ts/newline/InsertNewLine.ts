/**
 * InsertNewLine.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import { Fun } from '@ephox/katamari';
import InsertBlock from './InsertBlock';
import InsertBr from './InsertBr';
import NewLineAction from './NewLineAction';

const insert = function (editor, evt) {
  NewLineAction.getAction(editor, evt).fold(
    function () {
      InsertBr.insert(editor, evt);
    },
    function () {
      InsertBlock.insert(editor, evt);
    },
    Fun.noop
  );
};

export default {
  insert
};