/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { HTMLElement } from '@ephox/dom-globals';
import { Cell } from '@ephox/katamari';
import Editor from 'tinymce/core/api/Editor';
import Tools from 'tinymce/core/api/util/Tools';
import * as Actions from '../core/Actions';
import { DomTextMatcher } from '../core/DomTextMatcher';

type LastSuggestion = Actions.LastSuggestion;

const ignoreAll = true;

const getSuggestions = (editor: Editor, pluginUrl: string, lastSuggestionsState, startedState, textMatcherState, currentLanguageState, word, spans) => {
  const items = [];
  const suggestions = lastSuggestionsState.get().suggestions[word];

  Tools.each(suggestions, function (suggestion) {
    items.push({
      text: suggestion,
      onAction: () => {
        editor.insertContent(editor.dom.encode(suggestion));
        editor.dom.remove(spans);
        Actions.checkIfFinished(editor, startedState, textMatcherState);
      }
    });
  });

  const hasDictionarySupport = lastSuggestionsState.get().hasDictionarySupport;
  if (hasDictionarySupport) {
    items.push({ type: 'separator' });
    items.push({
      text: 'Add to dictionary',
      onAction: () => {
        Actions.addToDictionary(editor, pluginUrl, startedState, textMatcherState, currentLanguageState, word, spans);
      }
    });
  }

  items.push.apply(items, [
    {
      type: 'separator'
    },
    {
      text: 'Ignore',
      onAction: () => {
        Actions.ignoreWord(editor, startedState, textMatcherState, word, spans);
      }
    },

    {
      text: 'Ignore all',
      onAction: () => {
        Actions.ignoreWord(editor, startedState, textMatcherState, word, spans, ignoreAll);
      }
    }
  ]);
  return items;
};

const setup = function (editor: Editor, pluginUrl: string, lastSuggestionsState: Cell<LastSuggestion>, startedState: Cell<boolean>, textMatcherState: Cell<DomTextMatcher>, currentLanguageState: Cell<string>) {

  const update = (element: HTMLElement) => {
    const target = element;
    if (target.className === 'mce-spellchecker-word') {
      const spans = Actions.findSpansByIndex(editor, Actions.getElmIndex(target));
      if (spans.length > 0) {
        const rng = editor.dom.createRng();
        rng.setStartBefore(spans[0]);
        rng.setEndAfter(spans[spans.length - 1]);
        editor.selection.setRng(rng);
        return getSuggestions(editor, pluginUrl, lastSuggestionsState, startedState, textMatcherState, currentLanguageState, target.getAttribute('data-mce-word'), spans);
      }
    } else {
      return [];
    }
  };

  editor.ui.registry.addContextMenu('spellchecker', {
    update
  });
};

export {
  setup
};
