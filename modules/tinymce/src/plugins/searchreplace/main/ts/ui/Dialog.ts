import { Arr, Cell, Singleton } from '@ephox/katamari';

import Editor from 'tinymce/core/api/Editor';
import Env from 'tinymce/core/api/Env';
import { Dialog } from 'tinymce/core/api/ui/Ui';
import Tools from 'tinymce/core/api/util/Tools';

import * as Actions from '../core/Actions';

export interface DialogData {
  readonly findtext: string;
  readonly replacetext: string;
  readonly matchcase: boolean;
  readonly wholewords: boolean;
  readonly inselection: boolean;
}

const open = (editor: Editor, currentSearchState: Cell<Actions.SearchState>): void => {
  const dialogApi = Singleton.value<Dialog.DialogInstanceApi<DialogData>>();
  editor.undoManager.add();

  const selectedText = Tools.trim(editor.selection.getContent({ format: 'text' }));

  const updateButtonStates = (api: Dialog.DialogInstanceApi<DialogData>): void => {
    api.setEnabled('next', Actions.hasNext(editor, currentSearchState));
    api.setEnabled('prev', Actions.hasPrev(editor, currentSearchState));
  };

  const updateSearchState = (api: Dialog.DialogInstanceApi<DialogData>): void => {
    const data = api.getData();
    const current = currentSearchState.get();

    currentSearchState.set({
      ...current,
      matchCase: data.matchcase,
      wholeWord: data.wholewords,
      inSelection: data.inselection
    });
  };

  const disableAll = (api: Dialog.DialogInstanceApi<DialogData>, disable: boolean): void => {
    const buttons = [ 'replace', 'replaceall', 'prev', 'next' ];
    const toggle = (name: string) => api.setEnabled(name, !disable);
    Arr.each(buttons, toggle);
  };

  const toggleNotFoundAlert = (isVisible: boolean, api: Dialog.DialogInstanceApi<DialogData>): void => {
    api.redial(getDialogSpec(isVisible, api.getData()));
  };

  // Temporarily workaround for iOS/iPadOS dialog placement to hide the keyboard
  // TODO: Remove in 5.2 once iOS fixed positioning is fixed. See TINY-4441
  const focusButtonIfRequired = (api: Dialog.DialogInstanceApi<DialogData>, name: string): void => {
    if (Env.browser.isSafari() && Env.deviceType.isTouch() && (name === 'find' || name === 'replace' || name === 'replaceall')) {
      api.focus(name);
    }
  };

  const reset = (api: Dialog.DialogInstanceApi<DialogData>): void => {
    // Clean up the markers if required
    Actions.done(editor, currentSearchState, false);

    // Disable the buttons
    disableAll(api, true);
    updateButtonStates(api);
  };

  const doFind = (api: Dialog.DialogInstanceApi<DialogData>): void => {
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
      const count = Actions.find(editor, currentSearchState, data.findtext, data.matchcase, data.wholewords, data.inselection);
      if (count <= 0) {
        toggleNotFoundAlert(true, api);
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
    matchcase: initialState.matchCase,
    inselection: initialState.inSelection
  };

  const getPanelItems = (error: boolean): Dialog.BodyComponentSpec[] => {
    const items: Dialog.BodyComponentSpec[] = [
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
            enabled: false,
            borderless: true
          },
          {
            type: 'button',
            name: 'next',
            text: 'Next',
            icon: 'action-next',
            enabled: false,
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
    ];
    if (error) {
      items.push({
        type: 'alertbanner',
        level: 'error',
        text: 'Could not find the specified string.',
        icon: 'warning',
      });
    }
    return items;
  };

  const getDialogSpec = (showNoMatchesAlertBanner: boolean, initialData: DialogData): Dialog.DialogSpec<DialogData> => ({
    title: 'Find and Replace',
    size: 'normal',
    body: {
      type: 'panel',
      items: getPanelItems(showNoMatchesAlertBanner)
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
          },
          {
            type: 'togglemenuitem',
            name: 'inselection',
            text: 'Find in selection'
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
        enabled: false
      },
      {
        type: 'custom',
        name: 'replaceall',
        text: 'Replace all',
        enabled: false,
      }
    ],
    initialData,
    onChange: (api, details) => {
      if (showNoMatchesAlertBanner) {
        toggleNotFoundAlert(false, api);
      }
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
        case 'matchcase':
        case 'wholewords':
        case 'inselection':
          toggleNotFoundAlert(false, api);
          updateSearchState(api);
          reset(api);
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
  });

  dialogApi.set(editor.windowManager.open(getDialogSpec(false, initialData), { inline: 'toolbar' }));
};

export {
  open
};
