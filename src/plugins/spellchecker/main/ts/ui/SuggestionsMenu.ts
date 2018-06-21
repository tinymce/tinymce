/**
 * SuggestionsMenu.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import DOMUtils from 'tinymce/core/api/dom/DOMUtils';
import Factory from 'tinymce/core/api/ui/Factory';
import Tools from 'tinymce/core/api/util/Tools';
import Actions, { LastSuggestion } from '../core/Actions';
import { Editor } from 'tinymce/core/api/Editor';
import { Cell } from '@ephox/katamari';
import { DomTextMatcher } from 'tinymce/plugins/spellchecker/core/DomTextMatcher';
import { HTMLElement, document } from '@ephox/dom-globals';

let suggestionsMenu;

const showSuggestions = function (editor: Editor, pluginUrl: string, lastSuggestionsState: Cell<LastSuggestion>, startedState: Cell<boolean>, textMatcherState: Cell<DomTextMatcher>, currentLanguageState: Cell<string>, word: string, spans: HTMLElement[]) {
  const items = [], suggestions = lastSuggestionsState.get().suggestions[word];

  Tools.each(suggestions, function (suggestion) {
    items.push({
      text: suggestion,
      onclick () {
        editor.insertContent(editor.dom.encode(suggestion));
        editor.dom.remove(spans);
        Actions.checkIfFinished(editor, startedState, textMatcherState);
      }
    });
  });

  items.push({ text: '-' });

  const hasDictionarySupport = lastSuggestionsState.get().hasDictionarySupport;
  if (hasDictionarySupport) {
    items.push({
      text: 'Add to Dictionary', onclick () {
        Actions.addToDictionary(editor, pluginUrl, startedState, textMatcherState, currentLanguageState, word, spans);
      }
    });
  }

  items.push.apply(items, [
    {
      text: 'Ignore', onclick () {
        Actions.ignoreWord(editor, startedState, textMatcherState, word, spans);
      }
    },

    {
      text: 'Ignore all', onclick () {
        Actions.ignoreWord(editor, startedState, textMatcherState, word, spans, true);
      }
    }
  ]);

  // Render menu
  suggestionsMenu = Factory.create('menu', {
    items,
    context: 'contextmenu',
    onautohide (e) {
      if (e.target.className.indexOf('spellchecker') !== -1) {
        e.preventDefault();
      }
    },
    onhide () {
      suggestionsMenu.remove();
      suggestionsMenu = null;
    }
  });

  suggestionsMenu.renderTo(document.body);

  // Position menu
  const pos = DOMUtils.DOM.getPos(editor.getContentAreaContainer());
  const targetPos = editor.dom.getPos(spans[0]);
  const root = editor.dom.getRoot();

  // Adjust targetPos for scrolling in the editor
  if (root.nodeName === 'BODY') {
    targetPos.x -= root.ownerDocument.documentElement.scrollLeft || root.scrollLeft;
    targetPos.y -= root.ownerDocument.documentElement.scrollTop || root.scrollTop;
  } else {
    targetPos.x -= root.scrollLeft;
    targetPos.y -= root.scrollTop;
  }

  pos.x += targetPos.x;
  pos.y += targetPos.y;

  suggestionsMenu.moveTo(pos.x, pos.y + spans[0].offsetHeight);
};

const setup = function (editor: Editor, pluginUrl: string, lastSuggestionsState: Cell<LastSuggestion>, startedState: Cell<boolean>, textMatcherState: Cell<DomTextMatcher>, currentLanguageState: Cell<string>) {
  editor.on('click', function (e) {
    const target = e.target;

    if (target.className === 'mce-spellchecker-word') {
      e.preventDefault();

      const spans = Actions.findSpansByIndex(editor, Actions.getElmIndex(target));

      if (spans.length > 0) {
        const rng = editor.dom.createRng();
        rng.setStartBefore(spans[0]);
        rng.setEndAfter(spans[spans.length - 1]);
        editor.selection.setRng(rng);
        showSuggestions(editor, pluginUrl, lastSuggestionsState, startedState, textMatcherState, currentLanguageState, target.getAttribute('data-mce-word'), spans);
      }
    }
  });
};

export default {
  setup
};