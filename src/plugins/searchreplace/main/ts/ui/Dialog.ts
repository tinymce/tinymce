/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Editor } from 'tinymce/core/api/Editor';
import { Arr } from '@ephox/katamari';
import Tools from 'tinymce/core/api/util/Tools';

import Actions from '../core/Actions';
import { Types } from '@ephox/bridge';

export interface DialogData {
  findtext: string;
  replacetext: string;
  matchcase: boolean;
  wholewords: boolean;
}

const open = function (editor: Editor, currentIndexState) {
  let last: any = {}, selectedText: string;
  editor.undoManager.add();

  selectedText = Tools.trim(editor.selection.getContent({ format: 'text' }));

  function updateButtonStates(api: Types.Dialog.DialogInstanceApi<DialogData>) {
    const updateNext = Actions.hasNext(editor, currentIndexState) ? api.enable : api.disable;
    updateNext('next');
    const updatePrev = Actions.hasPrev(editor, currentIndexState) ? api.enable : api.disable;
    updatePrev('prev');
  }

  const disableAll = function (api: Types.Dialog.DialogInstanceApi<DialogData>, disable: boolean) {
    const buttons = [ 'replace', 'replaceall', 'prev', 'next' ];
    const toggle = disable ? api.disable : api.enable;
    Arr.each(buttons, toggle);
  };

  function notFoundAlert(api: Types.Dialog.DialogInstanceApi<DialogData>) {
    editor.windowManager.alert('Could not find the specified string.', function () {
      api.focus('findtext');
    });
  }

  const doSubmit = (api: Types.Dialog.DialogInstanceApi<DialogData>) => {
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
    const count = Actions.find(editor, currentIndexState, data.findtext, data.matchcase, data.wholewords);
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

  const initialData: DialogData = {
    findtext: selectedText,
    replacetext: '',
    matchcase: false,
    wholewords: false
  };
  editor.windowManager.open<DialogData>({
    title: 'Find and Replace',
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
              label: 'Find whole words only'
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
        text: 'Previous',
        align: 'end',
        icon: 'arrow-left',
        disabled: true,
      },
      {
        type: 'custom',
        name: 'next',
        text: 'Next',
        align: 'end',
        icon: 'arrow-right',
        disabled: true,
      }
    ],
    initialData,
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

export default {
  open
};
