/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Cell } from '@ephox/katamari';
import PluginManager from 'tinymce/core/api/PluginManager';

import * as Api from './api/Api';
import * as Commands from './api/Commands';
import * as Options from './api/Options';
import * as Buttons from './ui/Buttons';
import * as SuggestionsMenu from './ui/SuggestionsMenu';

export default (): void => {
  PluginManager.add('fsgspellchecker', (editor, pluginUrl) => {
    const startedState = Cell(false);
    const currentLanguageState = Cell<string>(Options.getLanguage(editor));
    const textMatcherState: Cell<any>/* noImplicitAny */ = Cell(null);
    const lastSuggestionsState: Cell<any>/* noImplicitAny */ = Cell(null);

	  Options.register(editor);
    Buttons.register(editor, pluginUrl, startedState, textMatcherState, currentLanguageState, lastSuggestionsState);
    SuggestionsMenu.setup(editor, pluginUrl, lastSuggestionsState, startedState, textMatcherState, currentLanguageState);
    Commands.register(editor, pluginUrl, startedState, textMatcherState, lastSuggestionsState, currentLanguageState);

    return Api.get(editor, startedState, lastSuggestionsState, textMatcherState, currentLanguageState);
  });
};
