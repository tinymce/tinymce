import { Arr, Obj, Optional } from '@ephox/katamari';
import { NodeTypes } from '@ephox/sugar';
import * as Sizzle from 'sizzle';

const sizzleEnabled = false;
type SizzleContext = Element | Document | DocumentFragment;
interface DecodedContainsSelector {
  baseSelector: string;
  text: string;
}

const selectAll = (selector: string, context: SizzleContext): Element[] => {
  return sizzleEnabled ? Sizzle(selector, context) : selectAllInternal(selector, context);
};

const selectAllInternal = (selector: string, context: SizzleContext): Element[] =>
  decodeContains(selector).fold(
    () => queryAll(context, selector),
    (decodedContainsSelector) => queryAllWithContains(context, decodedContainsSelector)
  );

const queryAllWithContains = (element: SizzleContext, { baseSelector, text }: DecodedContainsSelector) => {
  const baseSelectorMatch = queryAll(element, baseSelector);
  return Arr.filter(baseSelectorMatch, (e) => hasText(e, text));
};

const queryAll = (element: SizzleContext, selector: string) => Array.from(element.querySelectorAll(selector));

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

const hasText = (element: Node, text: string) => {
  if (element.nodeType === NodeTypes.TEXT) {
    return element.textContent.includes(text);
  }
  for (const child of Array.from(element.childNodes)) {
    if (hasText(child, text)) {
      return true;
    }
  }
  return false;
};

const matchesSelector = (element: Element, selector: string): boolean => {
  const root = element.getRootNode();
  /* TODO: remove this cast */
  const matches = selectAllInternal(selector, root as Document);
  return Arr.exists(matches, (e) => e === element);
};

export {
  selectAll,
  matchesSelector
};
