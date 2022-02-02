/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Editor from 'tinymce/core/api/Editor';
import Tools from 'tinymce/core/api/util/Tools';

import * as Settings from '../api/Settings';
import * as DateTimeHelper from './DateTimeHelper';
import * as Templates from './Templates';

const setup = (editor: Editor): void => {
  editor.on('PreProcess', (o) => {
    const dom = editor.dom, dateFormat = Settings.getMdateFormat(editor);

    Tools.each(dom.select('div', o.node), (e) => {
      if (dom.hasClass(e, 'mceTmpl')) {
        Tools.each(dom.select('*', e), (e) => {
          if (dom.hasClass(e, Settings.getModificationDateClasses(editor).replace(/\s+/g, '|'))) {
            e.innerHTML = DateTimeHelper.getDateTime(editor, dateFormat);
          }
        });

        Templates.replaceVals(editor, e);
      }
    });
  });
};

export {
  setup
};
