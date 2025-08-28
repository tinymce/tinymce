import { Arr } from '@ephox/katamari';
import { SugarElement, SugarText } from '@ephox/sugar';

import { Pattern, Position, TextMatch } from './Types';

interface IndexedTextMatch extends TextMatch {
  readonly matchId: number;
}

const find = (text: string, pattern: Pattern, start = 0, finish = text.length): Position[] => {
  const regex = pattern.regex;
  regex.lastIndex = start;
  const results = [];
  let match;
  while ((match = regex.exec(text))) {
    const matchedText = match[pattern.matchIndex];
    const matchStart = match.index + match[0].indexOf(matchedText);
    const matchFinish = matchStart + matchedText.length;

    // Stop finding matches if we've hit the finish mark
    if (matchFinish > finish) {
      break;
    }

    results.push({
      start: matchStart,
      finish: matchFinish
    });
    regex.lastIndex = matchFinish;
  }
  return results;
};

const extract = (elements: SugarElement<Text>[], matches: Position[]): TextMatch[][] => {
  // Walk over each text node and compare with the matches
  const nodePositions = Arr.foldl(elements, (acc, element) => {
    const content = SugarText.get(element);
    const start = acc.last;
    const finish = start + content.length;

    // Find positions for any matches in the current text node
    const positions = Arr.bind(matches, (match, matchIdx) => {
      // Check to see if the match overlaps with the text position
      if (match.start < finish && match.finish > start) {
        return [{
          element,
          start: Math.max(start, match.start) - start,
          finish: Math.min(finish, match.finish) - start,
          matchId: matchIdx
        }];
      } else {
        return [];
      }
    });

    return {
      results: acc.results.concat(positions),
      last: finish
    };
  }, { results: [] as IndexedTextMatch[], last: 0 }).results;

  // Group the positions by the match id
  return Arr.groupBy(nodePositions, (position) => position.matchId);
};

export {
  find,
  extract
};
