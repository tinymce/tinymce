import { Arr, Obj, Optional, Result, Strings } from '@ephox/katamari';

type LookupContext = Element | Document | DocumentFragment;
interface DecodedContainsSelector {
  baseSelector: string;
  text: string;
}

const selectAll = (selector: string, context: LookupContext): Element[] =>
  decodeContains(selector)
    .fold(
      (deocdeError) => {
        throw new Error(deocdeError);
      },
      (result) => result.fold(
        () => queryAll(context, selector),
        (decodedContainsSelector) => queryAllWithContains(context, decodedContainsSelector)
      )
    );

const decodeContains = (selector: string): Result<Optional<DecodedContainsSelector>, string> => {
  const regexp = /(?<baseSelector>.*):contains\((?<text>.*?)\)(?<remainings>.*)/;
  const matchedGroups = regexp.exec(selector)?.groups ?? {};
  if (!Obj.has(matchedGroups, 'baseSelector') || !Obj.has(matchedGroups, 'text')) {
    return Result.value(Optional.none());
  }
  if (Obj.has(matchedGroups, 'remainings') && Strings.trim(matchedGroups.remainings) !== '') {
    return Result.error(`Invalid selector '${selector}'. ':contains' in only supported at the end of the selector`);
  }
  return Result.value(Optional.some({ baseSelector: matchedGroups.baseSelector, text: unwrapFromQuotes(matchedGroups.text) }));
};

const unwrapFromQuotes = (pattern: string) => {
  const regexp = /^(?<quote>["'])(?<content>.*)\k<quote>$/;
  return regexp.exec(pattern)?.groups?.content ?? pattern;
};

const queryAll = (element: LookupContext, selector: string) => Array.from(element.querySelectorAll(selector));

const queryAllWithContains = (element: LookupContext, { baseSelector, text }: DecodedContainsSelector) => {
  const baseSelectorMatch = queryAll(element, baseSelector);
  return Arr.filter(baseSelectorMatch, (e) => hasText(e, text));
};

const hasText = (element: Node, text: string) =>
  Strings.contains(element.textContent, text);

const matchesSelector = (element: Element, selector: string): boolean =>
  decodeContains(selector)
    .fold(
      (deocdeError) => {
        throw new Error(deocdeError);
      },
      (result) => result.fold(
        () => matches(selector, element),
        (decodedContainsSelector) => matchesWithContains(decodedContainsSelector, element)
      )
    );

const matches = (selector: string, element: Element) => element.matches(selector);

const matchesWithContains = ({ baseSelector, text }: DecodedContainsSelector, element: Element) => {
  const matchesBaseSelector = matches(baseSelector, element);
  if (!matchesBaseSelector) {
    return false;
  }
  return hasText(element, text);
};

export {
  selectAll,
  matchesSelector
};
