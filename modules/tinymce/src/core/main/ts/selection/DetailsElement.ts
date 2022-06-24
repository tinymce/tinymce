import { Arr, Type } from '@ephox/katamari';

import Editor from '../api/Editor';

const preventSummaryToggle = (editor: Editor): void => {
  editor.on('click', (e) => {
    if (editor.dom.getParent(e.target, 'details')) {
      e.preventDefault();
    }
  });
};

// Forces the details element to always be open within the editor
const filterDetails = (editor: Editor): void => {
  editor.parser.addNodeFilter('details', (elms) => {
    Arr.each(elms, (details) => {
      details.attr('data-mce-open', details.attr('open'));
      details.attr('open', 'open');
    });
  });

  editor.serializer.addNodeFilter('details', (elms) => {
    Arr.each(elms, (details) => {
      const open = details.attr('data-mce-open');
      details.attr('open', Type.isString(open) ? open : null);
      details.attr('data-mce-open', null);
    });
  });
};

const setup = (editor: Editor): void => {
  preventSummaryToggle(editor);
  filterDetails(editor);
};

export {
  setup
};
