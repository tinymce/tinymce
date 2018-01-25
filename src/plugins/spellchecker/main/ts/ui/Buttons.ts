/**
 * Buttons.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import Tools from 'tinymce/core/api/util/Tools';
import Settings from '../api/Settings';
import Actions from '../core/Actions';

const buildMenuItems = function (listName, languageValues) {
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

const updateSelection = function (editor) {
  return function (e) {
    const selectedLanguage = Settings.getLanguage(editor);

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

const register = function (editor, pluginUrl, startedState, textMatcherState, currentLanguageState, lastSuggestionsState) {
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
    buttonArgs.onshow = updateSelection(editor);
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