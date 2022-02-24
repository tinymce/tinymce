import Editor from 'tinymce/core/api/Editor';
import Tools from 'tinymce/core/api/util/Tools';

import * as Options from '../api/Options';
import * as DateTimeHelper from './DateTimeHelper';
import * as Templates from './Templates';

const setup = (editor: Editor): void => {
  editor.on('PreProcess', (o) => {
    const dom = editor.dom, dateFormat = Options.getMdateFormat(editor);

    Tools.each(dom.select('div', o.node), (e) => {
      if (dom.hasClass(e, 'mceTmpl')) {
        Tools.each(dom.select('*', e), (e) => {
          if (dom.hasClass(e, Options.getModificationDateClasses(editor).replace(/\s+/g, '|'))) {
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
