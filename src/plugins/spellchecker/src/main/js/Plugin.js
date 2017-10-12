/**
 * Plugin.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  'tinymce.plugins.spellchecker.Plugin',
  [
    'ephox.katamari.api.Cell',
    'tinymce.core.PluginManager',
    'tinymce.plugins.spellchecker.alien.DetectProPlugin',
    'tinymce.plugins.spellchecker.api.Api',
    'tinymce.plugins.spellchecker.api.Commands',
    'tinymce.plugins.spellchecker.api.Settings',
    'tinymce.plugins.spellchecker.ui.Buttons',
    'tinymce.plugins.spellchecker.ui.SuggestionsMenu'
  ],
  function (Cell, PluginManager, DetectProPlugin, Api, Commands, Settings, Buttons, SuggestionsMenu) {
    PluginManager.add('spellchecker', function (editor, pluginUrl) {
      if (DetectProPlugin.hasProPlugin(editor) === false) {
        var startedState = Cell(false);
        var currentLanguageState = Cell(Settings.getLanguage(editor));
        var textMatcherState = Cell(null);
        var lastSuggestionsState = Cell({});

        Buttons.register(editor, pluginUrl, startedState, textMatcherState, currentLanguageState, lastSuggestionsState);
        SuggestionsMenu.setup(editor, pluginUrl, lastSuggestionsState, startedState, textMatcherState);
        Commands.register(editor, pluginUrl, startedState, textMatcherState, lastSuggestionsState, currentLanguageState);

        return Api.get(editor, startedState, lastSuggestionsState, textMatcherState, pluginUrl);
      }
    });

    return function () { };
  }
);