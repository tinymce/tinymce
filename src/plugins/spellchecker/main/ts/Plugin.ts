/**
 * Plugin.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import { Cell } from '@ephox/katamari';
import PluginManager from 'tinymce/core/api/PluginManager';
import DetectProPlugin from './alien/DetectProPlugin';
import Api from './api/Api';
import Commands from './api/Commands';
import Settings from './api/Settings';
import Buttons from './ui/Buttons';
import SuggestionsMenu from './ui/SuggestionsMenu';
import { LastSuggestion } from 'tinymce/plugins/spellchecker/core/Actions';

PluginManager.add('spellchecker', function (editor, pluginUrl) {
  if (DetectProPlugin.hasProPlugin(editor) === false) {
    const startedState = Cell(false);
    const currentLanguageState = Cell<string>(Settings.getLanguage(editor));
    const textMatcherState = Cell(null);
    const lastSuggestionsState = Cell<LastSuggestion>(null);

    Buttons.register(editor, pluginUrl, startedState, textMatcherState, currentLanguageState, lastSuggestionsState);
    SuggestionsMenu.setup(editor, pluginUrl, lastSuggestionsState, startedState, textMatcherState, currentLanguageState);
    Commands.register(editor, pluginUrl, startedState, textMatcherState, lastSuggestionsState, currentLanguageState);

    return Api.get(editor, startedState, lastSuggestionsState, textMatcherState, currentLanguageState, pluginUrl);
  }
});

export default function () { }