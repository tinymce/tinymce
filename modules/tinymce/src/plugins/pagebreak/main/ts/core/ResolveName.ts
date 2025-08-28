import Editor from 'tinymce/core/api/Editor';

import * as FilterContent from './FilterContent';

const setup = (editor: Editor): void => {
  editor.on('ResolveName', (e) => {
    if (e.target.nodeName === 'IMG' && editor.dom.hasClass(e.target, FilterContent.pageBreakClass)) {
      e.name = 'pagebreak';
    }
  });
};

export {
  setup
};
