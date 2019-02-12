/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { InlineContent, Types } from '@ephox/bridge';
import { Range } from '@ephox/dom-globals';
import { Arr, Option, Options } from '@ephox/katamari';
import { Editor } from 'tinymce/core/api/Editor';

import { getContext } from './AutocompleteContext';
import { AutocompleterDatabase } from './Autocompleters';
import Promise from 'tinymce/core/api/util/Promise';

const isStartOfWord = (rng: Range, text: string) => rng.startOffset === 0 || /\s/.test(text.charAt(rng.startOffset - 1));

const getTriggerContext = (initRange: Range, initText: string, database: AutocompleterDatabase): Option<{ range: Range, text: string, triggerChar: string }> => {
  return Options.findMap(database.triggerChars, (ch) => {
    return getContext(initRange, ch, initText, initRange.startOffset).map(({ rng, text }) => {
      return { range: rng, text, triggerChar: ch };
    });
  });
};

export interface AutocompleteLookupData {
  items: InlineContent.AutocompleterItemApi[];
  columns: Types.ColumnTypes;
  onAction: (autoApi: InlineContent.AutocompleterInstanceApi, rng, value: string, meta: Record<string, any>) => void;
}

const lookup = (editor: Editor, getDatabase: () => AutocompleterDatabase): Option<{ range: Range, triggerChar: string; lookupData: Promise<AutocompleteLookupData[]> }> => {
  const database = getDatabase();
  const rng = editor.selection.getRng();
  const startText = rng.startContainer.nodeValue;

  return getTriggerContext(rng, startText, database).map((context) => {
    const autocompleters = Arr.filter(database.lookupByChar(context.triggerChar), (autocompleter) => {
      return context.text.length >= autocompleter.minChars && autocompleter.matches.getOr(isStartOfWord)(context.range, startText, context.text);
    });
    const lookupData = Promise.all(Arr.map(autocompleters, (ac) => {
      // TODO: Find a sensible way to do maxResults
      const fetchResult = ac.fetch(context.text, ac.maxResults);
      return fetchResult.then((results) => ({
        items: results,
        columns: ac.columns,
        onAction: ac.onAction
      }));
    }));

    return {
      lookupData,
      triggerChar: context.triggerChar,
      range: context.range
    };
  });
};

export {
  lookup
};