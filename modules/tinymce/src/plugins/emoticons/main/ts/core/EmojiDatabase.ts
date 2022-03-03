import { Merger, Obj, Optional, Singleton, Strings } from '@ephox/katamari';

import Editor from 'tinymce/core/api/Editor';
import Resource from 'tinymce/core/api/Resource';

import * as Options from '../api/Options';

const ALL_CATEGORY = 'All';

interface RawEmojiEntry {
  readonly keywords: string[];
  readonly char: string;
  readonly category: string;
}

export interface EmojiEntry extends RawEmojiEntry {
  readonly title: string;
}

export interface EmojiDatabase {
  readonly listCategory: (category: string) => EmojiEntry[];
  readonly hasLoaded: () => boolean;
  readonly waitForLoad: () => Promise<boolean>;
  readonly listAll: () => EmojiEntry[];
  readonly listCategories: () => string[];
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

const translateCategory = (categories: Record<string, string>, name: string): string =>
  Obj.has(categories, name) ? categories[name] : name;

const getUserDefinedEmoji = (editor: Editor): Record<string, RawEmojiEntry> => {
  const userDefinedEmoticons = Options.getAppendedEmoji(editor);
  return Obj.map(userDefinedEmoticons, (value) =>
    // Set some sane defaults for the custom emoji entry
    ({ keywords: [], category: 'user', ...value })
  );
};

// TODO: Consider how to share this loading across different editors
const initDatabase = (editor: Editor, databaseUrl: string, databaseId: string): EmojiDatabase => {
  const categories = Singleton.value<Record<string, EmojiEntry[]>>();
  const all = Singleton.value<EmojiEntry[]>();

  const emojiImagesUrl = Options.getEmojiImageUrl(editor);

  const getEmoji = (lib: RawEmojiEntry) => {
    // Note: This is a little hacky, but the database doesn't provide a way for us to tell what sort of database is being used
    if (Strings.startsWith(lib.char, '<img')) {
      return lib.char.replace(/src="([^"]+)"/, (match, url) => `src="${emojiImagesUrl}${url}"`);
    } else {
      return lib.char;
    }
  };

  const processEmojis = (emojis: Record<string, RawEmojiEntry>) => {
    const cats: Record<string, EmojiEntry[]> = {};
    const everything: EmojiEntry[] = [];

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

    categories.set(cats);
    all.set(everything);
  };

  editor.on('init', () => {
    Resource.load(databaseId, databaseUrl).then((emojis) => {
      const userEmojis = getUserDefinedEmoji(editor);
      processEmojis(Merger.merge(emojis, userEmojis));
    }, (err) => {
      // eslint-disable-next-line no-console
      console.log(`Failed to load emojis: ${err}`);
      categories.set({});
      all.set([]);
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
        const interval = setInterval(() => {
          if (hasLoaded()) {
            clearInterval(interval);
            resolve(true);
          } else {
            numRetries--;
            if (numRetries < 0) {
              // eslint-disable-next-line no-console
              console.log('Could not load emojis from url: ' + databaseUrl);
              clearInterval(interval);
              reject(false);
            }
          }
        }, 100);
      });
    }
  };

  const hasLoaded = (): boolean => categories.isSet() && all.isSet();

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
