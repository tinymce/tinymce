import { Optional, Strings } from '@ephox/katamari';

import * as TextSearch from '../alien/TextSearch';
import DOMUtils from '../api/dom/DOMUtils';
import { getText, isValidTextRange, isWhitespace } from './AutocompleteUtils';

export interface AutocompleteContext {
  range: Range;
  text: string;
  trigger: string;
}

const stripTrigger = (text: string, trigger: string) => text.substring(trigger.length);

const findTrigger = (text: string, index: number, trigger: string, includeWhitespace = false): Optional<number> => {
  // Identify the `char` in, and start the text from that point forward. If there is ever any whitespace, fail
  let i: number;
  const firstChar = trigger.charAt(0);

  for (i = index - 1; i >= 0; i--) {
    const char = text.charAt(i);
    if (!includeWhitespace && isWhitespace(char)) {
      return Optional.none();
    }

    if (firstChar === char && Strings.contains(text, trigger, i, index)) {
      break;
    }
  }

  return Optional.some(i);
};

const getContext = (dom: DOMUtils, initRange: Range, trigger: string, includeWhitespace: boolean = false): Optional<AutocompleteContext> => {
  if (!isValidTextRange(initRange)) {
    return Optional.none();
  }

  const buffer = { text: '', offset: 0 };

  const findTriggerIndex = (element: Text, offset: number, text: string) => {
    buffer.text = text + buffer.text;
    buffer.offset += offset;
    // Stop searching by just returning the current offset if whitespace was found (eg Optional.none())
    // and we'll handle the final checks below instead
    return findTrigger(buffer.text, buffer.offset, trigger, includeWhitespace).getOr(offset);
  };

  const root = dom.getParent(initRange.startContainer, dom.isBlock) || dom.getRoot();
  return TextSearch.repeatLeft(dom, initRange.startContainer, initRange.startOffset, findTriggerIndex, root).bind((spot) => {
    const range = initRange.cloneRange();
    range.setStart(spot.container, spot.offset);
    range.setEnd(initRange.endContainer, initRange.endOffset);

    // If the range is collapsed then we didn't find a match so abort
    if (range.collapsed) {
      return Optional.none();
    }

    const text = getText(range);
    const triggerIndex = text.lastIndexOf(trigger);

    // If the match doesn't start with the trigger (eg whitespace found)
    if (triggerIndex !== 0) {
      return Optional.none();
    } else {
      return Optional.some({ text: stripTrigger(text, trigger), range, trigger });
    }
  });
};

export {
  findTrigger, // Exposed for testing.
  getContext
};

