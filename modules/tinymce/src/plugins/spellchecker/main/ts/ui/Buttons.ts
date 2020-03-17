/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Menu, Toolbar } from '@ephox/bridge';
import { Cell } from '@ephox/katamari';
import Editor from 'tinymce/core/api/Editor';
import Tools from 'tinymce/core/api/util/Tools';
import * as Settings from '../api/Settings';
import * as Actions from '../core/Actions';
import { DomTextMatcher } from '../core/DomTextMatcher';

type LastSuggestion = Actions.LastSuggestion;

const spellcheckerEvents = 'SpellcheckStart SpellcheckEnd';

const buildMenuItems = function (listName: string, languageValues) {
  const items = [];

  Tools.each(languageValues, function (languageValue) {
    items.push({
      selectable: true,
      text: languageValue.name,
      data: languageValue.value
    });
  });

  return items;
};

const getItems = function (editor) {
  return Tools.map(Settings.getLanguages(editor).split(','), function (langPair) {
    langPair = langPair.split('=');

    return {
      name: langPair[0],
      value: langPair[1]
    };
  });
};

const register = function (editor: Editor, pluginUrl: string, startedState: Cell<boolean>, textMatcherState: Cell<DomTextMatcher>, currentLanguageState: Cell<string>, lastSuggestionsState: Cell<LastSuggestion>) {
  const languageMenuItems = buildMenuItems('Language', getItems(editor));
  const startSpellchecking = function () {
    Actions.spellcheck(editor, pluginUrl, startedState, textMatcherState, lastSuggestionsState, currentLanguageState);
  };

  const buttonArgs: Toolbar.ToolbarToggleButtonApi = {
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

  const splitButtonArgs: Toolbar.ToolbarSplitButtonApi = {
    ...buttonArgs,
    type : 'splitbutton',
    select : (value) => value === currentLanguageState.get(),
    fetch : (callback) => {
      const items = Tools.map(languageMenuItems, (languageItem): Menu.ChoiceMenuItemApi => ({
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
