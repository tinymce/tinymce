/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Cell, Global, Obj, Option, Result } from '@ephox/katamari';
import ScriptLoader from 'tinymce/core/api/dom/ScriptLoader';
import Promise from 'tinymce/core/api/util/Promise';
import { Editor } from 'tinymce/core/api/Editor';

const ALL_CATEGORY = 'All';

export interface EmojiEntry {
  title: string;
  keywords: string[];
  char: string;
  category: string;
}

// TODO: Translations for category names
const categoryNameMap = {
  symbols: 'Symbols',
  people: 'People',
  animals_and_nature: 'Animals and Nature',
  food_and_drink: 'Food and Drink',
  activity: 'Activity',
  travel_and_places: 'Travel and Places',
  objects: 'Objects',
  flags: 'Flags'
};

// Do we have a better way of doing this in tinymce?
const GLOBAL_NAME = 'emoticons_plugin_database';

export interface EmojiDatabase {
  listCategory: (category: string) => EmojiEntry[];
  hasLoaded: () => boolean;
  waitForLoad: () => Promise<boolean>;
  listAll: () => EmojiEntry[];
  listCategories: () => string[];
}

const extractGlobal = (url: string): Result<Record<string, any>, any> => {
  if (Global.tinymce[GLOBAL_NAME]) {
    const result = Result.value(Global.tinymce[GLOBAL_NAME]);
    delete Global.tinymce[GLOBAL_NAME];
    return result;
  } else {
    return Result.error(`URL ${url} did not contain the expected format for emoticons`);
  }
};

const translateCategory = (name) => Obj.has(categoryNameMap, name) ? categoryNameMap[name] : name;

// TODO: Consider how to share this loading across different editors
const initDatabase = (editor: Editor, databaseUrl: string): EmojiDatabase => {
  const categories = Cell<Option<Record<string, EmojiEntry[]>>>(Option.none());
  const all = Cell<Option<EmojiEntry[]>>(Option.none());

  editor.on('init', () => {
    ScriptLoader.ScriptLoader.loadScript(databaseUrl, () => {
      const cats = { };
      const everything = [ ];

      extractGlobal(databaseUrl).fold(
        (err) => {
          console.log(err);
          categories.set(Option.some({ }));
          all.set(Option.some([ ]));
        },
        (emojis) => {
          Obj.each(emojis, (lib, n) => {
            const entry: EmojiEntry = {
              // Omitting fitzpatrick_scale
              title: n,
              keywords: lib.keywords,
              char: lib.char,
              category: translateCategory(lib.category)
            };
            const current = cats[entry.category] !== undefined ? cats[entry.category] : [ ];
            cats[entry.category] = current.concat([ entry ]);
            everything.push(entry);
          });

          categories.set(Option.some(cats));
          all.set(Option.some(everything));
        }
      );
    }, () => {

    });
  });

  const listCategory = (category: string): EmojiEntry[] => {
    if (category === ALL_CATEGORY) { return listAll(); }
    return categories.get().bind((cats) => {
      return Option.from(cats[category]);
    }).getOr([ ]);
  };

  const listAll = (): EmojiEntry[] => {
    return all.get().getOr([ ]) ;
  };

  const listCategories = (): string[] => {
    // TODO: Category key order should be adjusted to match the standard
    return [ ALL_CATEGORY ].concat(Obj.keys(categories.get().getOr({ })));

  };

  const waitForLoad = (): Promise<boolean> => {
    if (hasLoaded()) {
      return Promise.resolve(true);
    } else {
      return new Promise((resolve, reject) => {
        let numRetries = 3;
        const interval = setInterval(() => {
          if (hasLoaded()) {
            clearInterval(interval);
            resolve(true);
          } else {
            numRetries--;
            if (numRetries < 0) {
              console.log('Could not load emojis from url: ' + databaseUrl);
              clearInterval(interval);
              reject(false);
            }
          }
        }, 500);
      });
    }
  };

  const hasLoaded = (): boolean => {
    return categories.get().isSome() && all.get().isSome();
  };

  return {
    listCategories,
    hasLoaded,
    waitForLoad,
    listAll,
    listCategory
  };
};

// Load the script.

export {
  ALL_CATEGORY,
  initDatabase
};
