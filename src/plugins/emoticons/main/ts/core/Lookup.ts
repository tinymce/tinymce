/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Arr, Fun, Strings, Option } from '@ephox/katamari';

import { EmojiEntry } from './EmojiDatabase';

const emojiMatches = (emoji: EmojiEntry, pattern: string): boolean => {
  return Strings.contains(emoji.title.toLowerCase(), pattern.toLowerCase()) || Arr.exists(emoji.keywords, (k) => Strings.contains(k.toLowerCase(), pattern.toLowerCase()));
};

const emojisFrom = (list: EmojiEntry[], pattern: string, maxResults: Option<number>): Array<{value: string, icon: string, text: string }> => {
  const matches = [];
  const reachedLimit = maxResults.fold(() => Fun.never, (max) => (size) => size >= max);
  for (let i = 0; i < list.length; i++) {
    // TODO: more intelligent search by showing title matches at the top, keyword matches after that (use two arrays and concat at the end)
    if (pattern.length === 0 || emojiMatches(list[i], pattern)) {
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