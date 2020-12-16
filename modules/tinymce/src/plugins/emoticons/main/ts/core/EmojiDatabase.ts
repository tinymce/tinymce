/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Cell, Merger, Obj, Optional, Strings } from '@ephox/katamari';
import Editor from 'tinymce/core/api/Editor';
import Resource from 'tinymce/core/api/Resource';
import Delay from 'tinymce/core/api/util/Delay';
import Promise from 'tinymce/core/api/util/Promise';
import * as Settings from '../api/Settings';

const ALL_CATEGORY = 'All';

interface RawEmojiEntry {
  keywords: string[];
  char: string;
  category: string;
}

export interface EmojiEntry extends RawEmojiEntry {
  title: string;
}

const categoryNameMap = {
  symbols: 'Symbols',
  people: 'People',
  animals_and_nature: 'Animals and Nature',
  food_and_drink: 'Food and Drink',
  activity: 'Activity',
  travel_and_places: 'Travel and Places',
  objects: 'Objects',
  flags: 'Flags',
  user: 'User Defined'
};

export interface EmojiDatabase {
  listCategory: (category: string) => EmojiEntry[];
  hasLoaded: () => boolean;
  waitForLoad: () => Promise<boolean>;
  listAll: () => EmojiEntry[];
  listCategories: () => string[];
}

const translateCategory = (categories: Record<string, string>, name: string) => Obj.has(categories, name) ? categories[name] : name;

const getUserDefinedEmoticons = (editor: Editor) => {
  const userDefinedEmoticons = Settings.getAppendedEmoticons(editor);
  return Obj.map(userDefinedEmoticons, (value: RawEmojiEntry) =>
    // Set some sane defaults for the custom emoji entry
    ({ keywords: [], category: 'user', ...value })
  );
};

// TODO: Consider how to share this loading across different editors
const initDatabase = (editor: Editor, databaseUrl: string, databaseId: string): EmojiDatabase => {
  const categories = Cell<Optional<Record<string, EmojiEntry[]>>>(Optional.none());
  const all = Cell<Optional<EmojiEntry[]>>(Optional.none());

  const emojiImagesUrl = Settings.getEmotionsImageUrl(editor);

  const getEmoji = (lib: RawEmojiEntry) => {
    // Note: This is a little hacky, but the database doesn't provide a way for us to tell what sort of database is being used
    if (Strings.startsWith(lib.char, '<img')) {
      return lib.char.replace(/src="([^"]+)"/, (match, url) => `src="${emojiImagesUrl}${url}"`);
    } else {
      return lib.char;
    }
  };

  const processEmojis = (emojis: Record<string, RawEmojiEntry>) => {
    const cats = {};
    const everything = [];

    Obj.each(emojis, (lib: RawEmojiEntry, title: string) => {
      const entry: EmojiEntry = {
        // Omitting fitzpatrick_scale
        title,
        keywords: lib.keywords,
        char: getEmoji(lib),
        category: translateCategory(categoryNameMap, lib.category)
      };
      const current = cats[entry.category] !== undefined ? cats[entry.category] : [];
      cats[entry.category] = current.concat([ entry ]);
      everything.push(entry);
    });

    categories.set(Optional.some(cats));
    all.set(Optional.some(everything));
  };

  editor.on('init', () => {
    Resource.load(databaseId, databaseUrl).then((emojis) => {
      const userEmojis = getUserDefinedEmoticons(editor);
      processEmojis(Merger.merge(emojis, userEmojis));
    }, (err) => {
      // eslint-disable-next-line no-console
      console.log(`Failed to load emoticons: ${err}`);
      categories.set(Optional.some({}));
      all.set(Optional.some([]));
    });
  });

  const listCategory = (category: string): EmojiEntry[] => {
    if (category === ALL_CATEGORY) {
      return listAll();
    }
    return categories.get().bind((cats) => Optional.from(cats[category])).getOr([]);
  };

  const listAll = (): EmojiEntry[] => all.get().getOr([]);

  const listCategories = (): string[] =>
    // TODO: Category key order should be adjusted to match the standard
    [ ALL_CATEGORY ].concat(Obj.keys(categories.get().getOr({})));

  const waitForLoad = (): Promise<boolean> => {
    if (hasLoaded()) {
      return Promise.resolve(true);
    } else {
      return new Promise((resolve, reject) => {
        let numRetries = 15;
        const interval = Delay.setInterval(() => {
          if (hasLoaded()) {
            Delay.clearInterval(interval);
            resolve(true);
          } else {
            numRetries--;
            if (numRetries < 0) {
              // eslint-disable-next-line no-console
              console.log('Could not load emojis from url: ' + databaseUrl);
              Delay.clearInterval(interval);
              reject(false);
            }
          }
        }, 100);
      });
    }
  };

  const hasLoaded = (): boolean => categories.get().isSome() && all.get().isSome();

  return {
    listCategories,
    hasLoaded,
    waitForLoad,
    listAll,
    listCategory
  };
};

// Load the script.

export { ALL_CATEGORY, initDatabase };
