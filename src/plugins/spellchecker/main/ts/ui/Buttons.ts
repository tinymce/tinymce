/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Tools from 'tinymce/core/api/util/Tools';
import Settings from '../api/Settings';
import Actions, { LastSuggestion } from '../core/Actions';
import { Cell } from '@ephox/katamari';
import { Editor } from 'tinymce/core/api/Editor';
import { DomTextMatcher } from 'tinymce/plugins/spellchecker/core/DomTextMatcher';

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

const updateSelection = function (editor: Editor, currentLanguageState: Cell<string>) {
  return function (e) {
    const selectedLanguage = currentLanguageState.get();

    e.control.items().each(function (ctrl) {
      ctrl.active(ctrl.settings.data === selectedLanguage);
    });
  };
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

  const buttonArgs: any = {
    tooltip: 'Spellcheck',
    onclick: startSpellchecking,
    onPostRender (e) {
      const ctrl = e.control;

      editor.on('SpellcheckStart SpellcheckEnd', function () {
        ctrl.active(startedState.get());
      });
    }
  };

  if (languageMenuItems.length > 1) {
    buttonArgs.type = 'splitbutton';
    buttonArgs.menu = languageMenuItems;
    buttonArgs.onshow = updateSelection(editor, currentLanguageState);
    buttonArgs.onselect = function (e) {
      currentLanguageState.set(e.control.settings.data);
    };
  }

  editor.addButton('spellchecker', buttonArgs);

  editor.addMenuItem('spellchecker', {
    text: 'Spellcheck',
    context: 'tools',
    onclick: startSpellchecking,
    selectable: true,
    onPostRender () {
      const self = this;

      self.active(startedState.get());

      editor.on('SpellcheckStart SpellcheckEnd', function () {
        self.active(startedState.get());
      });
    }
  });
};

export default {
  register
};