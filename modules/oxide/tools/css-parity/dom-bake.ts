// TINYMCE-14907: browser-side DOM synthesis + computed-style reading. bake.ts runs
// both functions in the page via Playwright's page.evaluate(), which serializes each
// with `.toString()` — so each must be self-contained: no references to this module's
// top-level scope (imports, consts, other functions). Only `import type` is used here,
// which is erased entirely. Keep every helper nested inside the function using it.
import type { BakeRead, BakeTarget, CompoundSpec, HasSpec, SelectorStep } from './types';

// Every target goes into its own `<div><div class="tox">…</div></div>` cell under
// <body>, so all targets share one page without one's selector reaching into another's
// DOM — the cell keeps each `.tox` root an only child with no `.tox` siblings.
export const buildTargets = (args: { targets: Pick<BakeTarget, 'id' | 'steps'>[]; forced: string[]; forceAttr: string }): void => {
  const { targets, forced, forceAttr } = args;
  const pendingHas: { el: Element; has: HasSpec }[] = [];

  const applyCompound = (el: Element, compound: CompoundSpec): void => {
    for (const cls of compound.classes) {
      if (!compound.negatedClasses.includes(cls)) {
        el.classList.add(cls);
      }
    }
    if (compound.id) {
      el.id = compound.id;
    }
    for (const attr of compound.attributes) {
      const isNegated = compound.negatedAttributes.some((n) => n.name === attr.name && n.value === attr.value);
      if (!isNegated) {
        el.setAttribute(attr.name, attr.value ?? '');
      }
    }
    for (const pseudo of compound.pseudoClasses) {
      if (forced.includes(pseudo)) {
        // Forced by bake.ts through CDP once the tree is built.
        const existing = el.getAttribute(forceAttr);
        el.setAttribute(forceAttr, existing ? `${existing} ${pseudo}` : pseudo);
      } else if ((pseudo === 'checked' || pseudo === 'indeterminate') && el instanceof window.HTMLInputElement) {
        // A type-less <input> is a text field, which can't be :checked.
        if (!el.hasAttribute('type')) {
          el.type = 'checkbox';
        }
        el[pseudo] = true;
      } else if (pseudo === 'disabled' && 'disabled' in el) {
        (el as HTMLInputElement).disabled = true;
      } else if ((pseudo === 'link' || pseudo === 'any-link') && (el instanceof window.HTMLAnchorElement || el instanceof window.HTMLAreaElement)) {
        el.setAttribute('href', '#');
      }
      // Structural ones (:first-child, :only-child, :empty, ...) hold by construction:
      // nothing adds siblings or children beyond what the selector itself asks for.
    }
    if (compound.nonEmpty) {
      el.appendChild(document.createTextNode('x'));
    }
    for (const has of compound.has) {
      pendingHas.push({ el, has });
    }
  };

  // A tag-less compound is a <div>, unless its states need a form control to hold them.
  const tagFor = (compound: CompoundSpec): string => {
    if (compound.tag) {
      return compound.tag;
    } else if (compound.pseudoClasses.includes('checked') || compound.pseudoClasses.includes('indeterminate')) {
      return 'input';
    } else if (compound.pseudoClasses.some((pseudo) => pseudo === 'disabled' || pseudo === 'enabled')) {
      return 'button';
    }
    return 'div';
  };

  // :nth-child(P)/:nth-last-child(P) need P - 1 real siblings before/after the element
  // for the position to genuinely match — a lone child would satisfy neither. Same-tag
  // siblings, so :nth-of-type()/:not(:first-of-type) are satisfied too.
  const insertWithNthPadding = (parent: Element, el: Element, compound: CompoundSpec): void => {
    for (let i = 1; i < (compound.nthChildPosition ?? 1); i++) {
      parent.appendChild(document.createElement(el.localName));
    }
    parent.appendChild(el);
    for (let i = 1; i < (compound.nthLastChildPosition ?? 1); i++) {
      parent.appendChild(document.createElement(el.localName));
    }
  };

  const appendSteps = (start: Element, steps: SelectorStep[]): Element => {
    let lastEl = start;
    for (const step of steps) {
      const el = document.createElement(tagFor(step.compound));
      applyCompound(el, step.compound);
      // ' ' / '>' nest inside lastEl; '+' / '~' go after it, inside its parent.
      const parent = step.combinator === '+' || step.combinator === '~' ? lastEl.parentElement ?? lastEl : lastEl;
      insertWithNthPadding(parent, el, step.compound);
      lastEl = el;
    }
    return lastEl;
  };

  for (const target of targets) {
    const cell = document.createElement('div');
    const toxRoot = document.createElement('div');
    toxRoot.className = 'tox';
    cell.appendChild(toxRoot);
    document.body.appendChild(cell);

    let steps = target.steps;
    if (steps.length > 0 && steps[0].compound.classes.includes('tox')) {
      const rootCompound = steps[0].compound;
      applyCompound(toxRoot, { ...rootCompound, classes: rootCompound.classes.filter((c) => c !== 'tox') });
      steps = steps.slice(1);
    }

    appendSteps(toxRoot, steps).setAttribute('data-bake-target', String(target.id));
  }

  // :has() goes last, and only where the chain doesn't already satisfy it — e.g.
  // `.btn:has(.icon:only-child) .icon` already built its `.icon`, and adding a second
  // one would break :only-child. Subtrees can carry :has() of their own, hence the queue.
  for (let i = 0; i < pendingHas.length; i++) {
    const { el, has } = pendingHas[i];
    if (!el.matches(has.verifySelector)) {
      appendSteps(el, has.steps);
    }
  }
};

export const readTargets = (targets: Pick<BakeTarget, 'id' | 'selector' | 'verifySelector' | 'pseudoElement' | 'props' | 'customProps'>[]): BakeRead[] => {
  // A forced hover/focus state starts any CSS transition on the element, so reading
  // straight away can catch a value mid-way (flaky mismatches like alpha 0.11 vs 0.114).
  // Jump every running transition/animation to its end state first — unlike disabling
  // transitions via an injected stylesheet, this leaves computed `transition` values
  // untouched, so they're still compared.
  for (const animation of document.getAnimations()) {
    try {
      animation.finish();
    } catch {
      // An infinite animation (e.g. the skeleton shimmer) can't be finished — pin it to
      // its start instead, so the off and on pages don't sample it at different times.
      animation.pause();
      animation.currentTime = 0;
    }
  }

  const elements = new Map<string, Element>();
  document.querySelectorAll('[data-bake-target]').forEach((el) => elements.set(el.getAttribute('data-bake-target') ?? '', el));

  return targets.map((target): BakeRead => {
    const el = elements.get(String(target.id));
    if (!el || !CSS.supports(`selector(${target.selector})`)) {
      return { status: 'unsupported', computed: {}, fallbacks: [] };
    }

    const style = window.getComputedStyle(el, target.pseudoElement ?? undefined);
    const computed: Record<string, string> = {};
    for (const prop of target.props) {
      computed[prop] = style.getPropertyValue(prop);
    }
    const fallbacks = target.customProps.filter((name) => style.getPropertyValue(name).trim() === '');

    let matched = false;
    try {
      matched = el.matches(target.verifySelector);
    } catch {
      // Leave unmatched — the selector couldn't be checked.
    }
    if (!matched) {
      return { status: 'unmatched', computed, fallbacks };
    }
    // Chromium returns an empty declaration for a pseudo-element it can't compute
    // (e.g. ::-webkit-slider-thumb), which would compare as a false "match".
    return { status: target.pseudoElement && style.length === 0 ? 'unreadable' : 'ok', computed, fallbacks };
  });
};
