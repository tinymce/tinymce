/**
 * Buttons.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import Tools from 'tinymce/core/util/Tools';
import Settings from '../api/Settings';
import Actions from '../core/Actions';

var buildMenuItems = function (listName, languageValues) {
  var items = [];

  Tools.each(languageValues, function (languageValue) {
    items.push({
      selectable: true,
      text: languageValue.name,
      data: languageValue.value
    });
  });

  return items;
};

var updateSelection = function (editor) {
  return function (e) {
    var selectedLanguage = Settings.getLanguage(editor);

    e.control.items().each(function (ctrl) {
      ctrl.active(ctrl.settings.data === selectedLanguage);
    });
  };
};

var getItems = function (editor) {
  return Tools.map(Settings.getLanguages(editor).split(','), function (langPair) {
    langPair = langPair.split('=');

    return {
      name: langPair[0],
      value: langPair[1]
    };
  });
};

var register = function (editor, pluginUrl, startedState, textMatcherState, currentLanguageState, lastSuggestionsState) {
  var languageMenuItems = buildMenuItems('Language', getItems(editor));
  var startSpellchecking = function () {
    Actions.spellcheck(editor, pluginUrl, startedState, textMatcherState, lastSuggestionsState, currentLanguageState);
  };

  var buttonArgs: any = {
    tooltip: 'Spellcheck',
    onclick: startSpellchecking,
    onPostRender: function (e) {
      var ctrl = e.control;

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
    onPostRender: function () {
      var self = this;

      self.active(startedState.get());

      editor.on('SpellcheckStart SpellcheckEnd', function () {
        self.active(startedState.get());
      });
    }
  });
};

export default <any> {
  register: register
};