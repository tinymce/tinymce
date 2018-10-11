/**
 * Dialog.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */
import { Arr } from '@ephox/katamari';
import Tools from 'tinymce/core/api/util/Tools';

import Actions from '../core/Actions';

const open = function (editor, currentIndexState) {
  let last: any = {}, selectedText;
  editor.undoManager.add();

  selectedText = Tools.trim(editor.selection.getContent({ format: 'text' }));

  function updateButtonStates(api) {
    const updateNext = Actions.hasNext(editor, currentIndexState) ? api.enable : api.disable;
    updateNext('next');
    const updatePrev = Actions.hasPrev(editor, currentIndexState) ? api.enable : api.disable;
    updatePrev('prev');
  }

  const disableAll = function (api, disable: boolean) {
    const buttons = [ 'replace', 'replaceall', 'prev', 'next' ];
    const toggle = disable ? api.disable : api.enable;
    Arr.each(buttons, toggle);
  };

  function notFoundAlert(api) {
    editor.windowManager.alert('Could not find the specified string.', function () {
      api.focus('findtext');
    });
  }

  const doSubmit = (api) => {
    const data = api.getData();

    if (!data.findtext.length) {
      Actions.done(editor, currentIndexState, false);
      disableAll(api, true);
      updateButtonStates(api);
      return;
    }

    if (last.text === data.findtext && last.caseState === data.matchcase && last.wholeWord === data.wholewords) {
      if (!Actions.hasNext(editor, currentIndexState)) {
          notFoundAlert(api);
          return;
      }
      Actions.next(editor, currentIndexState);
      updateButtonStates(api);
      return;
    }
    const count = Actions.find(editor, currentIndexState, data.findtext, checkToBool(data.matchcase), checkToBool(data.wholewords));
    if (!count) {
      notFoundAlert(api);
    }

    disableAll(api, count === 0);
    updateButtonStates(api);

    last = {
      text: data.findtext,
      caseState: data.matchcase,
      wholeWord: data.wholewords
    };
  };

  editor.windowManager.open({
    title: 'Search and Replace',
    size: 'normal',
    body: {
      type: 'panel',
      items: [
        {
          type: 'input',
          name: 'findtext',
          label: 'Find'
        },
        {
          type: 'input',
          name: 'replacetext',
          label: 'Replace with'
        },
        {
          type: 'grid',
          columns: 2,
          items: [
            {
              type: 'checkbox',
              name: 'matchcase',
              label: 'Match case'
            },
            {
              type: 'checkbox',
              name: 'wholewords',
              label: 'Whole words'
            }
          ]
        }
      ]
    },
    buttons: [
      {
        type: 'custom',
        name: 'find',
        text: 'Find',
        align: 'start',
        primary: true
      },
      {
        type: 'custom',
        name: 'replace',
        text: 'Replace',
        align: 'start',
        disabled: true,
      },
      {
        type: 'custom',
        name: 'replaceall',
        text: 'Replace All',
        align: 'start',
        disabled: true,
      },
      {
        type: 'custom',
        name: 'prev',
        text: 'Prev',
        align: 'end',
        disabled: true,
      },
      {
        type: 'custom',
        name: 'next',
        text: 'Next',
        align: 'end',
        disabled: true,
      }
    ],
    initialData: {
      findtext: selectedText,
      replacetext: '',
      matchcase: 'unchecked',
      wholewords: 'unchecked'
    },
    onAction: (api, details) => {
      const data = api.getData();
      switch (details.name) {
        case 'find':
          doSubmit(api);
          break;
        case 'replace':
          if (!Actions.replace(editor, currentIndexState, data.replacetext)) {
            disableAll(api, true);
            currentIndexState.set(-1);
            last = {};
          }
          break;
        case 'replaceall':
          Actions.replace(editor, currentIndexState, data.replacetext, true, true);
          disableAll(api, true);
          last = {};
          break;
        case 'prev':
          Actions.prev(editor, currentIndexState);
          updateButtonStates(api);
          break;
        case 'next':
          Actions.next(editor, currentIndexState);
          updateButtonStates(api);
          break;
        default:
          break;
      }
    },
    onSubmit: doSubmit,
    onClose: () => {
      editor.focus();
      Actions.done(editor, currentIndexState);
      editor.undoManager.add();
    }
  });
};

const checkToBool = (value: string): boolean => {
  return value === 'checked';
};

export default {
  open
};
