/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Cell, Obj } from '@ephox/katamari';

import Editor from 'tinymce/core/api/Editor';
import Tools from 'tinymce/core/api/util/Tools';
import URI from 'tinymce/core/api/util/URI';
import XHR from 'tinymce/core/api/util/XHR';

import * as Events from '../api/Events';
import * as Settings from '../api/Settings';
import { DomTextMatcher } from './DomTextMatcher';

export interface Data {
  readonly words: Record<string, string[]>;
  readonly dictionary?: any;
}

export interface LastSuggestion {
  readonly suggestions: Record<string, string[]>;
  readonly hasDictionarySupport: boolean;
}

const getTextMatcher = (editor: Editor, textMatcherState) => {
  if (!textMatcherState.get()) {
    const textMatcher = DomTextMatcher(editor.getBody(), editor);
    textMatcherState.set(textMatcher);
  }

  return textMatcherState.get();
};

const defaultSpellcheckCallback = (editor: Editor, pluginUrl: string, currentLanguageState: Cell<string>) => {
  return (method: string, text: string, doneCallback: Function, errorCallback: Function) => {
    const data = { method, lang: currentLanguageState.get() };
    let postData = '';

    data[method === 'addToDictionary' ? 'word' : 'text'] = text;

    Tools.each(data, (value, key) => {
      if (postData) {
        postData += '&';
      }

      postData += key + '=' + encodeURIComponent(value);
    });
    XHR.send({
      url: new URI(pluginUrl).toAbsolute(Settings.getRpcUrl(editor)),
      type: 'post',
      content_type: 'application/x-www-form-urlencoded',
      data: postData,
      success: (result) => {
        const parseResult = JSON.parse(result);

        if (!parseResult) {
          const message = editor.translate(`Server response wasn't proper JSON.`);
          errorCallback(message);
        } else if (parseResult.error) {
          errorCallback(parseResult.error);
        } else {
          doneCallback(parseResult);
        }
      },
      error: () => {
        const message = editor.translate('The spelling service was not found: (') +
          Settings.getRpcUrl(editor) +
          editor.translate(')');
        errorCallback(message);
      }
    });
  };
};

const sendRpcCall = (editor: Editor, pluginUrl: string, currentLanguageState: Cell<string>, name: string, data: string, successCallback: Function, errorCallback?: Function): void => {
  const userSpellcheckCallback = Settings.getSpellcheckerCallback(editor);
  const spellCheckCallback = userSpellcheckCallback ? userSpellcheckCallback : defaultSpellcheckCallback(editor, pluginUrl, currentLanguageState);
  spellCheckCallback.call(editor.plugins.spellchecker, name, data, successCallback, errorCallback);
};

const spellcheck = (editor: Editor, pluginUrl: string, startedState: Cell<boolean>, textMatcherState: Cell<DomTextMatcher>, lastSuggestionsState: Cell<LastSuggestion>, currentLanguageState: Cell<string>): void => {
  if (finish(editor, startedState, textMatcherState)) {
    return;
  }

  const errorCallback = (message: string) => {
    editor.notificationManager.open({ text: message, type: 'error' });
    editor.setProgressState(false);
    finish(editor, startedState, textMatcherState);
  };

  const successCallback = (data: Data) => {
    markErrors(editor, startedState, textMatcherState, lastSuggestionsState, data);
  };

  editor.setProgressState(true);
  sendRpcCall(editor, pluginUrl, currentLanguageState, 'spellcheck', getTextMatcher(editor, textMatcherState).text, successCallback, errorCallback);
  editor.focus();
};

const checkIfFinished = (editor: Editor, startedState: Cell<boolean>, textMatcherState: Cell<DomTextMatcher>): void => {
  if (!editor.dom.select('span.mce-spellchecker-word').length) {
    finish(editor, startedState, textMatcherState);
  }
};

const addToDictionary = (editor: Editor, pluginUrl: string, startedState: Cell<boolean>, textMatcherState: Cell<DomTextMatcher>, currentLanguageState: Cell<string>, word: string, spans: Element[]): void => {
  editor.setProgressState(true);

  sendRpcCall(editor, pluginUrl, currentLanguageState, 'addToDictionary', word, () => {
    editor.setProgressState(false);
    editor.dom.remove(spans, true);
    checkIfFinished(editor, startedState, textMatcherState);
  }, (message) => {
    editor.notificationManager.open({ text: message, type: 'error' });
    editor.setProgressState(false);
  });
};

const ignoreWord = (editor: Editor, startedState: Cell<boolean>, textMatcherState: Cell<DomTextMatcher>, word: string, spans: Element[], all?: boolean): void => {
  editor.selection.collapse();

  if (all) {
    Tools.each(editor.dom.select('span.mce-spellchecker-word'), (span) => {
      if (span.getAttribute('data-mce-word') === word) {
        editor.dom.remove(span, true);
      }
    });
  } else {
    editor.dom.remove(spans, true);
  }

  checkIfFinished(editor, startedState, textMatcherState);
};

const finish = (editor: Editor, startedState: Cell<boolean>, textMatcherState: Cell<DomTextMatcher>) => {
  const bookmark = editor.selection.getBookmark();
  getTextMatcher(editor, textMatcherState).reset();
  editor.selection.moveToBookmark(bookmark);

  textMatcherState.set(null);

  if (startedState.get()) {
    startedState.set(false);
    Events.fireSpellcheckEnd(editor);
    return true;
  }
};

const getElmIndex = (elm: HTMLElement): string => {
  const value = elm.getAttribute('data-mce-index');

  if (typeof value === 'number') {
    return '' + value;
  }

  return value;
};

const findSpansByIndex = (editor: Editor, index: string): HTMLSpanElement[] => {
  const spans: HTMLSpanElement[] = [];

  const nodes = Tools.toArray(editor.getBody().getElementsByTagName('span'));
  if (nodes.length) {
    for (let i = 0; i < nodes.length; i++) {
      const nodeIndex = getElmIndex(nodes[i]);

      if (nodeIndex === null || !nodeIndex.length) {
        continue;
      }

      if (nodeIndex === index.toString()) {
        spans.push(nodes[i]);
      }
    }
  }

  return spans;
};

const markErrors = (editor: Editor, startedState: Cell<boolean>, textMatcherState: Cell<DomTextMatcher>, lastSuggestionsState: Cell<LastSuggestion>, data: Data): void => {
  const hasDictionarySupport = !!data.dictionary;
  const suggestions = data.words;

  editor.setProgressState(false);

  if (Obj.isEmpty(suggestions)) {
    const message = editor.translate('No misspellings found.');
    editor.notificationManager.open({ text: message, type: 'info' });
    startedState.set(false);
    return;
  }

  lastSuggestionsState.set({
    suggestions,
    hasDictionarySupport
  });

  const bookmark = editor.selection.getBookmark();

  getTextMatcher(editor, textMatcherState).find(Settings.getSpellcheckerWordcharPattern(editor)).filter((match) => {
    return !!suggestions[match.text];
  }).wrap((match) => {
    return editor.dom.create('span', {
      'class': 'mce-spellchecker-word',
      'aria-invalid': 'spelling',
      'data-mce-bogus': 1,
      'data-mce-word': match.text
    });
  });

  editor.selection.moveToBookmark(bookmark);

  startedState.set(true);
  Events.fireSpellcheckStart(editor);
};

export {
  spellcheck,
  checkIfFinished,
  addToDictionary,
  ignoreWord,
  findSpansByIndex,
  getElmIndex,
  markErrors
};
