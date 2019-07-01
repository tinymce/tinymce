/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Arr, Cell } from '@ephox/katamari';
import Editor from 'tinymce/core/api/Editor';
import Tools from 'tinymce/core/api/util/Tools';

import * as Actions from '../core/Actions';
import { Types } from '@ephox/bridge';
import I18n from 'tinymce/core/api/util/I18n';

export interface DialogData {
  findtext: string;
  replacetext: string;
  matchcase: boolean;
  wholewords: boolean;
}

const open = function (editor: Editor, currentSearchState: Cell<Actions.SearchState>) {
  editor.undoManager.add();

  const selectedText = Tools.trim(editor.selection.getContent({ format: 'text' }));

  function updateButtonStates(api: Types.Dialog.DialogInstanceApi<DialogData>) {
    const updateNext = Actions.hasNext(editor, currentSearchState) ? api.enable : api.disable;
    updateNext('next');
    const updatePrev = Actions.hasPrev(editor, currentSearchState) ? api.enable : api.disable;
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

  const reset = (api: Types.Dialog.DialogInstanceApi<DialogData>) => {
    // Clean up the markers if required
    Actions.done(editor, currentSearchState, false);

    // Disable the buttons
    disableAll(api, true);
    updateButtonStates(api);
  };

  const doFind = (api: Types.Dialog.DialogInstanceApi<DialogData>) => {
    const data = api.getData();
    const last = currentSearchState.get();

    if (!data.findtext.length) {
      reset(api);
      return;
    }

    // Same search text, so treat the find as a next click instead
    if (last.text === data.findtext && last.matchCase === data.matchcase && last.wholeWord === data.wholewords) {
      Actions.next(editor, currentSearchState);
    } else {
      // Find new matches
      const count = Actions.find(editor, currentSearchState, data.findtext, data.matchcase, data.wholewords);
      if (count <= 0) {
        notFoundAlert(api);
      }
      disableAll(api, count === 0);
    }

    updateButtonStates(api);
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
        // TODO TINY-3598: Use css to transform the icons when dir=rtl instead of swapping them
        icon: I18n.isRtl() ? 'arrow-right' : 'arrow-left',
        disabled: true,
      },
      {
        type: 'custom',
        name: 'next',
        text: 'Next',
        align: 'end',
        // TODO TINY-3598: Use css to transform the icons when dir=rtl instead of swapping them
        icon: I18n.isRtl() ? 'arrow-left' : 'arrow-right',
        disabled: true,
      }
    ],
    initialData,
    onChange: (api, details) => {
      if (details.name === 'findtext' && currentSearchState.get().count > 0) {
        reset(api);
      }
    },
    onAction: (api, details) => {
      const data = api.getData();
      switch (details.name) {
        case 'find':
          doFind(api);
          break;
        case 'replace':
          if (!Actions.replace(editor, currentSearchState, data.replacetext)) {
            reset(api);
          } else {
            updateButtonStates(api);
          }
          break;
        case 'replaceall':
          Actions.replace(editor, currentSearchState, data.replacetext, true, true);
          reset(api);
          break;
        case 'prev':
          Actions.prev(editor, currentSearchState);
          updateButtonStates(api);
          break;
        case 'next':
          Actions.next(editor, currentSearchState);
          updateButtonStates(api);
          break;
        default:
          break;
      }
    },
    onSubmit: doFind,
    onClose: () => {
      editor.focus();
      Actions.done(editor, currentSearchState);
      editor.undoManager.add();
    }
  });
};

export default {
  open
};
