/**
 * ToggleFormat.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import ApplyFormat from './ApplyFormat';
import MatchFormat from './MatchFormat';
import RemoveFormat from './RemoveFormat';

const toggle = function (editor, formats, name, vars, node) {
  const fmt = formats.get(name);

  if (MatchFormat.match(editor, name, vars, node) && (!('toggle' in fmt[0]) || fmt[0].toggle)) {
    RemoveFormat.remove(editor, name, vars, node);
  } else {
    ApplyFormat.applyFormat(editor, name, vars, node);
  }
};

export default {
  toggle
};