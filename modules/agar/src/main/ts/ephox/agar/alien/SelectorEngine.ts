import { Arr, Obj, Optional, Strings } from '@ephox/katamari';

type LookupContext = Element | Document | DocumentFragment;
interface DecodedContainsSelector {
  baseSelector: string;
  text: string;
}

const selectAll = (selector: string, context: LookupContext): Element[] =>
  decodeContains(selector).fold(
    () => queryAll(context, selector),
    (decodedContainsSelector) => queryAllWithContains(context, decodedContainsSelector)
  );

const decodeContains = (selector: string): Optional<DecodedContainsSelector> => {
  const regexp = /(?<baseSelector>.*):contains\((?<text>.*)\)$/;
  const matchedGroups = regexp.exec(selector)?.groups ?? {};
  if (!Obj.has(matchedGroups, 'baseSelector') || !Obj.has(matchedGroups, 'text')) {
    return Optional.none();
  }
  return Optional.some({ baseSelector: matchedGroups.baseSelector, text: unwrapFromQuotes(matchedGroups.text) });
};

const unwrapFromQuotes = (pattern: string) => {
  const regexp = /^(?<quote>["'])(?<content>.*)\k<quote>$/;
  const matchedGroups = regexp.exec(pattern)?.groups ?? {};
  return matchedGroups.content ?? pattern;
};

const queryAll = (element: LookupContext, selector: string) => Array.from(element.querySelectorAll(selector));

const queryAllWithContains = (element: LookupContext, { baseSelector, text }: DecodedContainsSelector) => {
  const baseSelectorMatch = queryAll(element, baseSelector);
  return Arr.filter(baseSelectorMatch, (e) => hasText(e, text));
};

const hasText = (element: Node, text: string) =>
  Strings.contains(element.textContent, text);

const matchesSelector = (element: Element, selector: string): boolean =>
  decodeContains(selector).fold(
    () => matches(selector, element),
    (decodedContainsSelector) => matchesWithContains(decodedContainsSelector, element)
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
