/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Cell } from '@ephox/katamari';

import Editor from 'tinymce/core/api/Editor';
import { Menu, Toolbar } from 'tinymce/core/api/ui/Ui';
import Tools from 'tinymce/core/api/util/Tools';

import * as Settings from '../api/Settings';
import * as Actions from '../core/Actions';
import { DomTextMatcher } from '../core/DomTextMatcher';

type LastSuggestion = Actions.LastSuggestion;

interface LanguageValue {
  readonly name: string;
  readonly value: string;
}

const spellcheckerEvents = 'SpellcheckStart SpellcheckEnd';

const buildMenuItems = (listName: string, languageValues: LanguageValue[]) => {
  const items = [];

  Tools.each(languageValues, (languageValue) => {
    items.push({
      selectable: true,
      text: languageValue.name,
      data: languageValue.value
    });
  });

  return items;
};

const getItems = (editor: Editor): LanguageValue[] => {
  return Tools.map(Settings.getLanguages(editor).split(','), (langPair) => {
    const langPairs = langPair.split('=');

    return {
      name: langPairs[0],
      value: langPairs[1]
    };
  });
};

const register = (editor: Editor, pluginUrl: string, startedState: Cell<boolean>, textMatcherState: Cell<DomTextMatcher>, currentLanguageState: Cell<string>, lastSuggestionsState: Cell<LastSuggestion>): void => {
  const languageMenuItems = buildMenuItems('Language', getItems(editor));
  const startSpellchecking = () => {
    Actions.spellcheck(editor, pluginUrl, startedState, textMatcherState, lastSuggestionsState, currentLanguageState);
  };

  const buttonArgs: Toolbar.ToolbarToggleButtonSpec = {
    tooltip: 'Spellcheck',
    onAction: startSpellchecking,
    icon: 'spell-check',
    onSetup: (buttonApi) => {
      const setButtonState = () => {
        buttonApi.setActive(startedState.get());
      };
      editor.on(spellcheckerEvents, setButtonState);
      return () => {
        editor.off(spellcheckerEvents, setButtonState);
      };
    }
  };

  const splitButtonArgs: Toolbar.ToolbarSplitButtonSpec = {
    ...buttonArgs,
    type: 'splitbutton',
    select: (value) => value === currentLanguageState.get(),
    fetch: (callback) => {
      const items = Tools.map(languageMenuItems, (languageItem): Menu.ChoiceMenuItemSpec => ({
        type: 'choiceitem',
        value: languageItem.data,
        text: languageItem.text
      }));
      callback(items);
    },
    onItemAction: (splitButtonApi, value) => {
      currentLanguageState.set(value);
    }
  };

  if (languageMenuItems.length > 1) {
    editor.ui.registry.addSplitButton('spellchecker', splitButtonArgs);
  } else {
    editor.ui.registry.addToggleButton('spellchecker', buttonArgs);
  }

  editor.ui.registry.addToggleMenuItem('spellchecker', {
    text: 'Spellcheck',
    icon: 'spell-check',
    onSetup: (menuApi) => {
      menuApi.setActive(startedState.get());
      const setMenuItemCheck = () => {
        menuApi.setActive(startedState.get());
      };
      editor.on(spellcheckerEvents, setMenuItemCheck);
      return () => {
        editor.off(spellcheckerEvents, setMenuItemCheck);
      };
    },
    onAction: startSpellchecking
  });

};

export {
  register
};
