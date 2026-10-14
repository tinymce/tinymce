// TINYMCE-14907: shared types for the css-parity tool. Type-only — safe to import
// from dom-bake.ts, which must otherwise stay free of runtime imports (see its header).

export type Combinator = ' ' | '>' | '+' | '~';

export interface AttributeSelector {
  name: string;
  operator?: string;
  value?: string;
}

export interface HasSpec {
  // The whole `:has(...)` pseudo, rewritten like BakeTarget.verifySelector — used to
  // skip synthesis when the surrounding chain already satisfies it.
  verifySelector: string;
  // First branch of the :has() argument; its leading combinator is relative to the
  // :has() subject (` ` / `>` = inside it, `+` / `~` = after it).
  steps: SelectorStep[];
}

export interface CompoundSpec {
  tag?: string;
  classes: string[];
  id?: string;
  attributes: AttributeSelector[];
  // Every pseudo-class other than :not/:has/:nth-*. dom-bake.ts applies the ones it
  // knows; BakeTarget.verifySelector reports whether that was enough.
  pseudoClasses: string[];
  negatedClasses: string[];
  negatedAttributes: AttributeSelector[];
  // Smallest 1-based sibling position (from the start/end respectively) that satisfies
  // a parsed :nth-child()/:nth-last-child() formula (or the -of-type variants, or a
  // negated :first-child/:last-child) — dom-bake pads in that many same-tag dummy
  // siblings so the selector genuinely matches by position.
  nthChildPosition?: number;
  nthLastChildPosition?: number;
  // From :not(:empty) — the element needs a child.
  nonEmpty?: boolean;
  has: HasSpec[];
}

export interface SelectorStep {
  // Combinator connecting this compound to the previous one (root step uses ' ').
  combinator: Combinator;
  compound: CompoundSpec;
}

// One unique selector (per @media condition) to synthesize, with every property any of
// its declaration blocks sets across both compiles.
export interface BakeTarget {
  id: number;
  selector: string;
  // The @media condition the rule sits inside, or null for a top-level rule.
  media: string | null;
  // BEM block of the rightmost `tox-` class, used to group the report.
  component: string;
  steps: SelectorStep[];
  pseudoElement: string | null;
  // `selector` minus its pseudo-element, with CDP-forced pseudo-classes replaced by
  // the marker attribute dom-bake.ts sets — `el.matches()` doesn't see forced states.
  verifySelector: string;
  props: string[];
  // Custom properties the rule's declarations read through var() that the flag-on
  // compile declares somewhere. If one of them is undefined on the synthesized element,
  // the comparison only saw its fallback (see BakeRead.fallbacks).
  customProps: string[];
}

export interface SkippedRule {
  selector: string;
  reason: string;
}

// ok: the synthesized element matches the selector.
// unmatched: it doesn't, so the rule's own declarations may not be what was compared.
// unsupported: Chromium drops the selector (e.g. ::-ms-expand), nothing to compare.
// unreadable: getComputedStyle can't read this pseudo-element.
export type BakeStatus = 'ok' | 'unmatched' | 'unsupported' | 'unreadable';

export interface BakeRead {
  status: BakeStatus;
  computed: Record<string, string>;
  // BakeTarget.customProps that resolved to nothing on the element — the rule used the
  // var() fallback, so the custom property's own value was never compared.
  fallbacks: string[];
}

export interface DiffMismatch {
  prop: string;
  offValue: string;
  onValue: string;
}
