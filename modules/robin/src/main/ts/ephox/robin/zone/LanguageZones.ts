import { Universe } from '@ephox/boss';
import { Fun, Optional } from '@ephox/katamari';
import { WordDecisionItem } from '../words/WordDecision';

export interface ZoneDetails<E> {
  readonly lang: string;
  readonly details: WordDecisionItem<E>[];
}

export interface LanguageZones<E> {
  openInline: (optLang: Optional<string>, elem: E) => void;
  closeInline: (optLang: Optional<string>, elem: E) => void;
  addDetail: (detail: WordDecisionItem<E>) => void;
  addEmpty: (empty: E) => void;
  openBoundary: (optLang: Optional<string>, elem: E) => void;
  closeBoundary: (optLang: Optional<string>, elem: E) => void;
  done: () => ZoneDetails<E>[];
}

const nu = function <E> (defaultLang: string): LanguageZones<E> {
  let stack: string[] = [];

  const zones: ZoneDetails<E>[] = [];

  let zone: WordDecisionItem<E>[] = [];
  let zoneLang = defaultLang;

  const push = function (optLang: Optional<string>) {
    optLang.each(function (l) {
      stack.push(l);
    });
  };

  const pop = function (optLang: Optional<string>) {
    optLang.each(function (_l) {
      stack = stack.slice(0, stack.length - 1);
    });
  };

  const topOfStack = function () {
    return Optional.from(stack[stack.length - 1]);
  };

  const pushZone = function () {
    if (zone.length > 0) {
      // Intentionally, not a zone. These are details
      zones.push({
        lang: zoneLang,
        details: zone
      });
    }
  };

  const spawn = function (newLang: string) {
    pushZone();
    zone = [];
    zoneLang = newLang;
  };

  const getLang = function (optLang: Optional<string>) {
    return optLang.or(topOfStack()).getOr(defaultLang);
  };

  const openInline = function (optLang: Optional<string>, _elem: E) {
    const lang = getLang(optLang);
    // If the inline tag being opened is different from the current top of the stack,
    // then we don't want to create a new zone.
    if (lang !== zoneLang) {
      spawn(lang);
    }
    push(optLang);
  };

  const closeInline = function (optLang: Optional<string>, _elem: E) {
    pop(optLang);
  };

  const addDetail = function (detail: WordDecisionItem<E>) {
    const lang = getLang(Optional.none());
    // If the top of the stack is not the same as zoneLang, then we need to spawn again.
    if (lang !== zoneLang) {
      spawn(lang);
    }
    zone.push(detail);
  };

  const addEmpty = function (_empty: E) {
    const lang = getLang(Optional.none());
    spawn(lang);
  };

  const openBoundary = function (optLang: Optional<string>, _elem: E) {
    push(optLang);
    const lang = getLang(optLang);
    spawn(lang);
  };

  const closeBoundary = function (optLang: Optional<string>, _elem: E) {
    pop(optLang);
    const lang = getLang(optLang);
    spawn(lang);
  };

  const done = function () {
    pushZone();
    return zones.slice(0);
  };

  return {
    openInline,
    closeInline,
    addDetail,
    addEmpty,
    openBoundary,
    closeBoundary,
    done
  };
};

// Returns: Optional(string) of the LANG attribute of the closest ancestor element or None.
//  - uses Fun.never for isRoot parameter to search even the top HTML element
//    (regardless of 'classic'/iframe or 'inline'/div mode).
// Note: there may be descendant elements with a different language
const calculate = function <E, D> (universe: Universe<E, D>, item: E): Optional<string> {
  return universe.up().closest(item, '[lang]', Fun.never).bind(function (el) {
    const lang = universe.attrs().get(el, 'lang');
    return lang === undefined ? Optional.none<string>() : Optional.some(lang);
  });
};

const strictBounder = function (envLang: string, onlyLang: string) {
  return function <E, D> (universe: Universe<E, D>, item: E): boolean {
    const itemLang = calculate(universe, item).getOr(envLang);
    return onlyLang !== itemLang;
  };
};

const softBounder = function (optLang: Optional<string>) {
  return function <E, D> (universe: Universe<E, D>, item: E): boolean {
    const itemLang = calculate(universe, item);
    return !optLang.equals(itemLang);
  };
};

export const LanguageZones = {
  nu,
  calculate,
  softBounder,
  strictBounder
};
