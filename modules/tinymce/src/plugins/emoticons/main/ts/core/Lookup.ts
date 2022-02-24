import { Arr, Fun, Optional, Strings } from '@ephox/katamari';

import { EmojiEntry } from './EmojiDatabase';

const emojiMatches = (emoji: EmojiEntry, lowerCasePattern: string): boolean =>
  Strings.contains(emoji.title.toLowerCase(), lowerCasePattern) ||
  Arr.exists(emoji.keywords, (k) => Strings.contains(k.toLowerCase(), lowerCasePattern));

const emojisFrom = (list: EmojiEntry[], pattern: string, maxResults: Optional<number>): Array<{ value: string; icon: string; text: string }> => {
  const matches = [];
  const lowerCasePattern = pattern.toLowerCase();
  const reachedLimit = maxResults.fold(() => Fun.never, (max) => (size) => size >= max);
  for (let i = 0; i < list.length; i++) {
    // TODO: more intelligent search by showing title matches at the top, keyword matches after that (use two arrays and concat at the end)
    if (pattern.length === 0 || emojiMatches(list[i], lowerCasePattern)) {
      matches.push({
        value: list[i].char,
        text: list[i].title,
        icon: list[i].char
      });
      if (reachedLimit(matches.length)) {
        break;
      }
    }
  }
  return matches;
};

export {
  emojisFrom
};
