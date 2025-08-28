import { Arr, Obj, Optional, Result, Strings } from '@ephox/katamari';

type LookupContext = Element | Document | DocumentFragment;
interface DecodedContainsSelector {
  baseSelector: string;
  text: string;
}

const CONTAINS_REGEXP = /(?<baseSelector>.*):contains\((?<text>.*?)\)(?<remainings>.*)/;
const CONTAINS_REGEXP_SINGLE_QUOTE = /(?<baseSelector>.*):contains\('(?<text>.*?)'\)(?<remainings>.*)/;
const CONTAINS_REGEXP_DOUBLE_QUOTE = /(?<baseSelector>.*):contains\("(?<text>.*?)"\)(?<remainings>.*)/;
const CONTAINS_REGEXPS = [ CONTAINS_REGEXP_DOUBLE_QUOTE, CONTAINS_REGEXP_SINGLE_QUOTE, CONTAINS_REGEXP ];

const selectAll = (selector: string, context: LookupContext): Element[] =>
  decodeContains(selector).getOrDie()
    .fold(
      () => queryAll(context, selector),
      (decodedContainsSelector) => queryAllWithContains(context, decodedContainsSelector)
    );

const decodeContains = (selector: string): Result<Optional<DecodedContainsSelector>, string> => {
  const selectorGroups = Arr.findMap(CONTAINS_REGEXPS, (regexp) => {
    const matchedGroups = regexp.exec(selector)?.groups ?? {};
    if (Obj.has(matchedGroups, 'baseSelector') && Obj.has(matchedGroups, 'text')) {
      return Optional.from(matchedGroups);
    }
    return Optional.none();
  });
  return selectorGroups.fold(
    () => Result.value(Optional.none()),
    ({ baseSelector, text, remainings }) => {
      if (remainings !== undefined && Strings.trim(remainings) !== '') {
        return Result.error(`Invalid selector '${selector}'. ':contains' is only supported as the last pseudo-class.`);
      }
      return Result.value(Optional.some({ baseSelector, text }));
    }
  );
};

const queryAll = (element: LookupContext, selector: string) => Array.from(element.querySelectorAll(selector));

const queryAllWithContains = (element: LookupContext, { baseSelector, text }: DecodedContainsSelector) => {
  const baseSelectorMatch = queryAll(element, baseSelector);
  return Arr.filter(baseSelectorMatch, (e) => hasText(e, text));
};

const hasText = (element: Node, text: string) =>
  Strings.contains(element.textContent, text);

const matchesSelector = (element: Element, selector: string): boolean =>
  decodeContains(selector).getOrDie()
    .fold(
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
