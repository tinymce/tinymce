/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Types } from '@ephox/bridge';
import { Arr, Cell, Singleton } from '@ephox/katamari';
import Editor from 'tinymce/core/api/Editor';
import Env from 'tinymce/core/api/Env';
import Tools from 'tinymce/core/api/util/Tools';

import * as Actions from '../core/Actions';

export interface DialogData {
  findtext: string;
  replacetext: string;
  matchcase: boolean;
  wholewords: boolean;
}

const open = function (editor: Editor, currentSearchState: Cell<Actions.SearchState>) {
  const dialogApi = Singleton.value<Types.Dialog.DialogInstanceApi<DialogData>>();
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

  // Temporarily workaround for iOS/iPadOS dialog placement to hide the keyboard
  // TODO: Remove in 5.2 once iOS fixed positioning is fixed. See TINY-4441
  const focusButtonIfRequired = (api: Types.Dialog.DialogInstanceApi<DialogData>, name: string) => {
    if (Env.browser.isSafari() && Env.deviceType.isTouch() && (name === 'find' || name === 'replace' || name === 'replaceall')) {
      api.focus(name);
    }
  };

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

  const initialState = currentSearchState.get();

  const initialData: DialogData = {
    findtext: selectedText,
    replacetext: '',
    wholewords: initialState.wholeWord,
    matchcase: initialState.matchCase
  };

  const spec: Types.Dialog.DialogApi<DialogData> = {
    title: 'Find and Replace',
    size: 'normal',
    body: {
      type: 'panel',
      items: [
        {
          type: 'bar',
          items: [
            {
              type: 'input',
              name: 'findtext',
              placeholder: 'Find',
              maximized: true,
              inputMode: 'search'
            },
            {
              type: 'button',
              name: 'prev',
              text: 'Previous',
              icon: 'action-prev',
              disabled: true,
              borderless: true
            },
            {
              type: 'button',
              name: 'next',
              text: 'Next',
              icon: 'action-next',
              disabled: true,
              borderless: true
            }
          ]
        },
        {
          type: 'input',
          name: 'replacetext',
          placeholder: 'Replace with',
          inputMode: 'search'
        },
      ]
    },
    buttons: [
      {
        type: 'menu',
        name: 'options',
        icon: 'preferences',
        tooltip: 'Preferences',
        align: 'start',
        items: [
          {
            type: 'togglemenuitem',
            name: 'matchcase',
            text: 'Match case'
          }, {
            type: 'togglemenuitem',
            name: 'wholewords',
            text: 'Find whole words only'
          }
        ]
      },
      {
        type: 'custom',
        name: 'find',
        text: 'Find',
        primary: true
      },
      {
        type: 'custom',
        name: 'replace',
        text: 'Replace',
        disabled: true,
      },
      {
        type: 'custom',
        name: 'replaceall',
        text: 'Replace All',
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

      focusButtonIfRequired(api, details.name);
    },
    onSubmit: (api) => {
      doFind(api);
      focusButtonIfRequired(api, 'find');
    },
    onClose: () => {
      editor.focus();
      Actions.done(editor, currentSearchState);
      editor.undoManager.add();
    }
  };

  dialogApi.set(editor.windowManager.open(spec, {inline: 'toolbar'}));
};

export default {
  open
};
