/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { InlineContent, Types } from '@ephox/bridge';
import { Node, Range } from '@ephox/dom-globals';
import { Arr, Option } from '@ephox/katamari';
import DOMUtils from 'tinymce/core/api/dom/DOMUtils';
import Editor from 'tinymce/core/api/Editor';
import Promise from 'tinymce/core/api/util/Promise';

import * as Spot from '../alien/Spot';
import { toLeaf } from '../alien/TextDescent';
import { repeatLeft } from '../alien/TextSearch';
import { AutocompleteContext, getContext } from './AutocompleteContext';
import { AutocompleterDatabase } from './Autocompleters';
import { isWhitespace } from './AutocompleteUtils';

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

const isPreviousCharContent = (dom: DOMUtils, leaf: Spot.SpotPoint<Node>) =>
  // If at the start of the range, then we need to look backwards one more place. Otherwise we just need to look at the current text
  repeatLeft(dom, leaf.container, leaf.offset, (element, offset) => offset === 0 ? -1 : offset, dom.getRoot()).filter((spot) => {
    const char = spot.container.data.charAt(spot.offset - 1);
    return !isWhitespace(char);
  }).isSome();

const isStartOfWord = (dom: DOMUtils) => (rng: Range) => {
  const leaf = toLeaf(rng.startContainer, rng.startOffset);
  return !isPreviousCharContent(dom, leaf);
};

const getTriggerContext = (dom: DOMUtils, initRange: Range, database: AutocompleterDatabase): Option<AutocompleteContext> => Arr.findMap(database.triggerChars, (ch) => getContext(dom, initRange, ch));

const lookup = (editor: Editor, getDatabase: () => AutocompleterDatabase): Option<AutocompleteLookupInfo> => {
  const database = getDatabase();
  const rng = editor.selection.getRng();

  return getTriggerContext(editor.dom, rng, database).bind((context) => lookupWithContext(editor, getDatabase, context));
};

const lookupWithContext = (editor: Editor, getDatabase: () => AutocompleterDatabase, context: AutocompleteContext, fetchOptions: Record<string, any> = {}): Option<AutocompleteLookupInfo> => {
  const database = getDatabase();
  const rng = editor.selection.getRng();
  const startText = rng.startContainer.nodeValue;

  const autocompleters = Arr.filter(database.lookupByChar(context.triggerChar), (autocompleter) => context.text.length >= autocompleter.minChars && autocompleter.matches.getOrThunk(() => isStartOfWord(editor.dom))(context.range, startText, context.text));

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
