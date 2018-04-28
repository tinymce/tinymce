/**
 * FilterContent.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import Tools from 'tinymce/core/api/util/Tools';
import Settings from '../api/Settings';
import DateTimeHelper from './DateTimeHelper';
import Templates from './Templates';

const setup = function (editor) {
  editor.on('PreProcess', function (o) {
    const dom = editor.dom, dateFormat = Settings.getMdateFormat(editor);

    Tools.each(dom.select('div', o.node), function (e) {
      if (dom.hasClass(e, 'mceTmpl')) {
        Tools.each(dom.select('*', e), function (e) {
          if (dom.hasClass(e, editor.getParam('template_mdate_classes', 'mdate').replace(/\s+/g, '|'))) {
            e.innerHTML = DateTimeHelper.getDateTime(editor, dateFormat);
          }
        });

        Templates.replaceVals(editor, e);
      }
    });
  });
};

export default {
  setup
};