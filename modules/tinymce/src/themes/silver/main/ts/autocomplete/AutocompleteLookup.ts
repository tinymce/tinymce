/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { InlineContent, Types } from '@ephox/bridge';
import { Range, Text } from '@ephox/dom-globals';
import { Arr, Option, Options, Fun } from '@ephox/katamari';
import Editor from 'tinymce/core/api/Editor';
import Promise from 'tinymce/core/api/util/Promise';
import DOMUtils from 'tinymce/core/api/dom/DOMUtils';

import { toLeaf } from '../alien/TextDescent';
import { Phase, repeatLeft } from '../alien/TextSearch';
import { AutocompleteContext, getContext } from './AutocompleteContext';
import { AutocompleterDatabase } from './Autocompleters';

export interface AutocompleteLookupData {
  matchText: string;
  items: InlineContent.AutocompleterContents[];
  columns: Types.ColumnTypes;
  onAction: (autoApi: InlineContent.AutocompleterInstanceApi, rng: Range, value: string, meta: Record<string, any>) => void;
}

export interface AutocompleteLookupInfo {
  context: AutocompleteContext;
  lookupData: Promise<AutocompleteLookupData[]>;
}

const isStartOfWord = (dom: DOMUtils) => {
  const process = (phase: Phase<boolean>, element: Text, text: string, optOffset: Option<number>) => {
    const index = optOffset.getOr(text.length);
    // If at the start of the range, then we need to look backwards one more place. Otherwise we just need to look at the current text
    return (index === 0) ? phase.kontinue() : phase.finish(/\s/.test(text.charAt(index - 1)));
  };

  return (rng: Range) => {
    const leaf = toLeaf(rng.startContainer, rng.startOffset);
    return repeatLeft(dom, leaf.element, leaf.offset, process).fold(Fun.constant(true), Fun.constant(true), Fun.identity);
  };
};

const getTriggerContext = (dom: DOMUtils, initRange: Range, database: AutocompleterDatabase): Option<AutocompleteContext> => {
  return Options.findMap(database.triggerChars, (ch) => {
    return getContext(dom, initRange, ch);
  });
};

const lookup = (editor: Editor, getDatabase: () => AutocompleterDatabase): Option<AutocompleteLookupInfo> => {
  const database = getDatabase();
  const rng = editor.selection.getRng();

  return getTriggerContext(editor.dom, rng, database).bind((context) => lookupWithContext(editor, getDatabase, context));
};

const lookupWithContext = (editor: Editor, getDatabase: () => AutocompleterDatabase, context: AutocompleteContext, fetchOptions: Record<string, any> = {}): Option<AutocompleteLookupInfo> => {
  const database = getDatabase();
  const rng = editor.selection.getRng();
  const startText = rng.startContainer.nodeValue;

  const autocompleters = Arr.filter(database.lookupByChar(context.triggerChar), (autocompleter) => {
    return context.text.length >= autocompleter.minChars && autocompleter.matches.getOrThunk(() => isStartOfWord(editor.dom))(context.range, startText, context.text);
  });

  if (autocompleters.length === 0) {
    return Option.none();
  }

  const lookupData = Promise.all(Arr.map(autocompleters, (ac) => {
    // TODO: Find a sensible way to do maxResults
    const fetchResult = ac.fetch(context.text, ac.maxResults, fetchOptions);
    return fetchResult.then((results) => ({
      matchText: context.text,
      items: results,
      columns: ac.columns,
      onAction: ac.onAction
    }));
  }));

  return Option.some({
    lookupData,
    context
  });
};

export {
  lookup,
  lookupWithContext
};
