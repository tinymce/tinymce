import { Universe } from '@ephox/boss';
import { Arr, Fun, Optional, Optionals } from '@ephox/katamari';

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

const nu = <E>(defaultLang: string): LanguageZones<E> => {
  let stack: string[] = [];

  const zones: ZoneDetails<E>[] = [];

  let zone: WordDecisionItem<E>[] = [];
  let zoneLang = defaultLang;

  const push = (optLang: Optional<string>) => {
    optLang.each((l) => {
      stack.push(l);
    });
  };

  const pop = (optLang: Optional<string>) => {
    optLang.each((_l) => {
      stack = stack.slice(0, stack.length - 1);
    });
  };

  const topOfStack = () => {
    return Optional.from(stack[stack.length - 1]);
  };

  const pushZone = () => {
    if (zone.length > 0) {
      // Intentionally, not a zone. These are details
      zones.push({
        lang: zoneLang,
        details: zone
      });
    }
  };

  const spawn = (newLang: string) => {
    pushZone();
    zone = [];
    zoneLang = newLang;
  };

  const getLang = (optLang: Optional<string>) => {
    return optLang.or(topOfStack()).getOr(defaultLang);
  };

  const openInline = (optLang: Optional<string>, _elem: E) => {
    const lang = getLang(optLang);
    // If the inline tag being opened is different from the current top of the stack,
    // then we don't want to create a new zone.
    if (lang !== zoneLang) {
      spawn(lang);
    }
    push(optLang);
  };

  const closeInline = (optLang: Optional<string>, _elem: E) => {
    pop(optLang);
  };

  const addDetail = (detail: WordDecisionItem<E>) => {
    const lang = getLang(Optional.none());
    // If the top of the stack is not the same as zoneLang, then we need to spawn again.
    if (lang !== zoneLang) {
      spawn(lang);
    }
    zone.push(detail);
  };

  const addEmpty = (_empty: E) => {
    const lang = getLang(Optional.none());
    spawn(lang);
  };

  const openBoundary = (optLang: Optional<string>, _elem: E) => {
    push(optLang);
    const lang = getLang(optLang);
    spawn(lang);
  };

  const closeBoundary = (optLang: Optional<string>, _elem: E) => {
    pop(optLang);
    const lang = getLang(optLang);
    spawn(lang);
  };

  const done = () => {
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
const calculate = <E, D>(universe: Universe<E, D>, item: E): Optional<string> => {
  const props = universe.property();
  return props.getLanguage(item).orThunk(() => {
    const ancestors = universe.up().all(item, Fun.never);
    return Arr.findMap(ancestors, props.getLanguage);
  });
};

const strictBounder = (envLang: string, onlyLang: string) => {
  return <E, D>(universe: Universe<E, D>, item: E): boolean => {
    const itemLang = calculate(universe, item).getOr(envLang);
    return onlyLang !== itemLang;
  };
};

const softBounder = (optLang: Optional<string>) => {
  return <E, D>(universe: Universe<E, D>, item: E): boolean => {
    const itemLang = calculate(universe, item);
    return !Optionals.equals(optLang, itemLang);
  };
};

export const LanguageZones = {
  nu,
  calculate,
  softBounder,
  strictBounder
};
