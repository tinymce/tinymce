import { InlineContent, Types } from '@ephox/bridge';
import { Range } from '@ephox/dom-globals';
import { Arr, Option, Options } from '@ephox/katamari';
import { Editor } from 'tinymce/core/api/Editor';

import { getContext } from './AutocompleteContext';
import { AutocompleterDatabase } from './Autocompleters';
import Promise from 'tinymce/core/api/util/Promise';

const getTriggerContext = (initRange: Range, initText: string, database: AutocompleterDatabase): Option<{ range: Range, text: string, triggerChar: string }> => {
  return Options.findMap(database.triggerChars, (ch) => {
    return getContext(initRange, ch, initText, initRange.startOffset, 0).map(({ rng, text }) => {
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
    const autocompleters = database.lookupByChar(context.triggerChar);
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