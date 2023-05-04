import { Arr } from '@ephox/katamari';

import Editor from '../api/Editor';
import * as Options from '../api/Options';

const preventSummaryToggle = (editor: Editor): void => {
  editor.on('click', (e) => {
    if (editor.dom.getParent(e.target, 'details')) {
      e.preventDefault();
    }
  });
};

const filterDetails = (editor: Editor): void => {
  editor.parser.addNodeFilter('details', (elms) => {
    const initialStateOption = Options.getDetailsInitialState(editor);
    Arr.each(elms, (details) => {
      if (initialStateOption === 'expanded') {
        details.attr('open', 'open');
      } else if (initialStateOption === 'collapsed') {
        details.attr('open', null);
      } else if (initialStateOption === 'inherited') {
        details.attr('open', details.attr('open'));
      }
    });
  });

  editor.serializer.addNodeFilter('details', (elms) => {
    const serializedStateOption = Options.getDetailsSerializedState(editor);
    Arr.each(elms, (details) => {
      if (serializedStateOption === 'expanded') {
        details.attr('open', 'open');
      } else if (serializedStateOption === 'collapsed') {
        details.attr('open', null);
      } else if (serializedStateOption === 'inherited') {
        details.attr('open', details.attr('open'));
      }
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
