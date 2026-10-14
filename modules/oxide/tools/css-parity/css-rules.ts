// TINYMCE-14907: extracts every rule out of the two compiled oxide skin stylesheets
// (flag off/on), parsing each selector into the plain SelectorStep chain that
// dom-bake.ts knows how to synthesize DOM for.
import postcss from 'postcss';
import selectorParser from 'postcss-selector-parser';

import type { BakeTarget, Combinator, CompoundSpec, SelectorStep, SkippedRule } from './types';

// Applied through CDP (CSS.forcePseudoState) rather than synthesized — see bake.ts.
export const FORCED_PSEUDOS = [ 'hover', 'active', 'focus', 'focus-visible', 'focus-within', 'visited' ];
export const FORCE_ATTR = 'data-bake-force';

const toBlock = (className: string): string => className.replace(/(__|--).*$/, '');

const emptyCompound = (): CompoundSpec => ({
  classes: [],
  attributes: [],
  pseudoClasses: [],
  negatedClasses: [],
  negatedAttributes: [],
  has: []
});

const isPseudoElement = (pseudo: selectorParser.Pseudo): boolean =>
  pseudo.value.startsWith('::') || pseudo.value === ':before' || pseudo.value === ':after';

// Parses a :nth-child()/:nth-last-child() argument (`even`, `odd`, `<b>`, `<a>n`,
// `<a>n<+/-b>`) and returns the smallest 1-based sibling position >= 1 that satisfies
// it, or null if the formula can't be parsed (the target then shows up as unmatched).
const parseNthPosition = (arg: string): number | null => {
  const trimmed = arg.trim().toLowerCase();
  if (trimmed === 'odd') {
    return 1;
  }
  if (trimmed === 'even') {
    return 2;
  }
  const plainInteger = /^[+-]?\d+$/;
  if (plainInteger.test(trimmed)) {
    const b = parseInt(trimmed, 10);
    return b >= 1 ? b : null;
  }
  const anb = /^([+-]?\d*)n(?:\s*([+-]\s*\d+))?$/.exec(trimmed.replace(/\s+/g, ''));
  if (!anb) {
    return null;
  }
  const [ , aRaw, bRaw ] = anb;
  let a: number;
  if (aRaw === '' || aRaw === '+') {
    a = 1;
  } else if (aRaw === '-') {
    a = -1;
  } else {
    a = parseInt(aRaw, 10);
  }
  const b = bRaw === undefined ? 0 : parseInt(bRaw.replace(/\s+/g, ''), 10);
  for (let n = 0; n < 1000; n++) {
    const position = a * n + b;
    if (position >= 1) {
      return position;
    }
  }
  return null;
};

// Drops pseudo-elements and swaps CDP-forced pseudo-classes for the FORCE_ATTR marker
// dom-bake.ts sets — forced :hover/:active never show up in `el.matches()`, even
// though they do apply to styles. Inside :not() this stays correct, as a negated
// state is never marked.
const toVerifySelector = (node: selectorParser.Selector | selectorParser.Pseudo): string => {
  const clone = node.clone({}) as typeof node;
  clone.walkPseudos((pseudo) => {
    const name = pseudo.value.replace(/^::?/, '');
    if (isPseudoElement(pseudo)) {
      pseudo.remove();
    } else if (FORCED_PSEUDOS.includes(name)) {
      pseudo.replaceWith(selectorParser.attribute({ attribute: FORCE_ATTR, operator: '~=', value: name, raws: {}, quoteMark: null }));
    }
  });
  return String(clone).trim();
};

const applyNegation = (compound: CompoundSpec, negated: selectorParser.Selector): void => {
  negated.each((node) => {
    if (node.type === 'class') {
      compound.negatedClasses.push(node.value);
    } else if (node.type === 'attribute') {
      compound.negatedAttributes.push({ name: node.attribute, operator: node.operator, value: node.value });
    } else if (node.value === ':first-child' || node.value === ':first-of-type') {
      compound.nthChildPosition ??= 2;
    } else if (node.value === ':last-child' || node.value === ':last-of-type') {
      compound.nthLastChildPosition ??= 2;
    } else if (node.value === ':empty') {
      compound.nonEmpty = true;
    }
  });
};

const parseCompound = (nodes: selectorParser.Node[]): { compound: CompoundSpec; pseudoElement: string | null } => {
  const compound = emptyCompound();
  let pseudoElement: string | null = null;

  for (const node of nodes) {
    switch (node.type) {
      case 'tag':
        compound.tag = node.value;
        break;
      case 'class':
        compound.classes.push(node.value);
        break;
      case 'id':
        compound.id = node.value;
        break;
      case 'attribute':
        compound.attributes.push({ name: node.attribute, operator: node.operator, value: node.value });
        break;
      case 'pseudo': {
        const name = node.value.replace(/^::?/, '');
        if (isPseudoElement(node)) {
          pseudoElement = `::${name}`;
        } else if (name === 'not' && node.nodes.length === 1) {
          applyNegation(compound, node.nodes[0]);
        } else if (name === 'has' && node.nodes.length > 0) {
          compound.has.push({ verifySelector: toVerifySelector(node), steps: splitIntoSteps(node.nodes[0]).steps });
        } else if (/^nth-(last-)?(child|of-type)$/.test(name)) {
          // Padding siblings share the element's tag, so -of-type positions work the same way.
          const position = parseNthPosition(node.nodes[0]?.toString() ?? '');
          if (position !== null && !name.startsWith('nth-last')) {
            compound.nthChildPosition = position;
          } else if (position !== null) {
            compound.nthLastChildPosition = position;
          }
        } else {
          compound.pseudoClasses.push(name);
        }
        break;
      }
      default:
        // universal/comment/nesting/string nodes add no constraint we need to synthesize.
        break;
    }
  }

  return { compound, pseudoElement };
};

const splitIntoSteps = (selector: selectorParser.Selector): { steps: SelectorStep[]; pseudoElement: string | null } => {
  const steps: SelectorStep[] = [];
  let currentNodes: selectorParser.Node[] = [];
  let pendingCombinator: Combinator = ' ';
  let pseudoElement: string | null = null;

  const flush = () => {
    if (currentNodes.length === 0) {
      return;
    }
    const parsed = parseCompound(currentNodes);
    steps.push({ combinator: pendingCombinator, compound: parsed.compound });
    pseudoElement = pseudoElement ?? parsed.pseudoElement;
    currentNodes = [];
  };

  selector.each((node) => {
    if (node.type === 'combinator') {
      flush();
      const trimmed = node.value.trim();
      pendingCombinator = (trimmed === '' ? ' ' : trimmed) as Combinator;
    } else {
      currentNodes.push(node);
    }
  });
  flush();

  return { steps, pseudoElement };
};

// A selector only names the classes it needs, but the real markup follows BEM: a
// modifier (`.tox-x--m`) always sits on an element that also has its base class, and an
// element (`.tox-x__y`) always sits inside its block. Components declare their custom
// properties on those base/block elements, so without them a rule like
// `.tox .tox-dialog__header` would only ever be compared against its var() fallback.
// Adds the missing base classes and block ancestors — both compiles get the same DOM.
const withBemContext = (steps: SelectorStep[]): SelectorStep[] => {
  const isNegated = (cls: string) => steps.some(({ compound }) => compound.negatedClasses.includes(cls));

  const withModifierBases = steps.map(({ combinator, compound }) => {
    const bases = compound.classes
      .filter((cls) => cls.startsWith('tox-') && cls.includes('--'))
      .map((cls) => cls.slice(0, cls.indexOf('--')))
      .filter((base) => !compound.classes.includes(base) && !isNegated(base));
    return { combinator, compound: { ...compound, classes: [ ...compound.classes, ...new Set(bases) ] }};
  });

  // Block ancestors go right under the `.tox` root, around the whole chain, so they
  // can't come between two compounds joined by `>`, `+` or `~`. When the chain itself
  // starts with one of those, an extra ancestor would break it — leave it alone.
  const insertAt = withModifierBases[0]?.compound.classes.includes('tox') ? 1 : 0;
  if (insertAt >= withModifierBases.length || withModifierBases[insertAt].combinator !== ' ') {
    return withModifierBases;
  }

  const blocks = new Set<string>();
  withModifierBases.forEach(({ compound }, index) => {
    compound.classes
      .filter((cls) => cls.startsWith('tox-') && cls.includes('__'))
      .map((cls) => cls.slice(0, cls.indexOf('__')))
      .filter((block) => !isNegated(block) && !withModifierBases.slice(0, index + 1).some((step) => step.compound.classes.includes(block)))
      .forEach((block) => blocks.add(block));
  });

  const ancestors: SelectorStep[] = [ ...blocks ].map((block) => ({ combinator: ' ', compound: { ...emptyCompound(), classes: [ block ] }}));
  return [ ...withModifierBases.slice(0, insertAt), ...ancestors, ...withModifierBases.slice(insertAt) ];
};

// Report group: BEM block of the rightmost `tox-` class outside any :has()/:not()
// argument (`.tox .tox-ai-html-content li` -> "ai-html-content").
const componentOf = (branch: selectorParser.Selector): string => {
  let component = 'tox';
  branch.each((node) => {
    if (node.type === 'class' && node.value.startsWith('tox-')) {
      component = toBlock(node.value).replace(/^tox-/, '');
    }
  });
  return component;
};

// Only a top-level rule or one directly inside a top-level @media is evaluated —
// bake.ts emulates the media conditions. Rules inside @keyframes aren't selectors.
const mediaOf = (rule: postcss.Rule): { media: string | null } | { skip: string } | null => {
  const parent = rule.parent;
  if (parent?.type === 'root') {
    return { media: null };
  }
  if (parent?.type === 'atrule') {
    const atRule = parent as postcss.AtRule;
    if (atRule.name.endsWith('keyframes')) {
      return null;
    }
    if (atRule.name === 'media' && atRule.parent?.type === 'root') {
      return { media: atRule.params };
    }
    return { skip: `inside @${atRule.name} ${atRule.params}` };
  }
  return { skip: 'nested inside another rule' };
};

const VAR_REFERENCE = /var\(\s*(--[\w-]+)/g;

const referencedCustomProps = (decls: postcss.Declaration[]): string[] =>
  decls.flatMap((decl) => [ ...decl.value.matchAll(VAR_REFERENCE) ].map(([ , name ]) => name));

export const extractTargets = (cssTexts: string[]): { targets: BakeTarget[]; skipped: SkippedRule[] } => {
  const targets = new Map<string, BakeTarget & { propSet: Set<string>; customPropSet: Set<string> }>();
  const skipped = new Map<string, SkippedRule>();
  const roots = cssTexts.map((cssText) => postcss.parse(cssText));

  // Only the flag-on compile declares custom properties, so the union over both compiles
  // is what it declares.
  const declaredCustomProps = new Set<string>();
  roots.forEach((root) => root.walkDecls(/^--/, (decl) => {
    declaredCustomProps.add(decl.prop);
  }));

  for (const root of roots) {
    root.walkRules((rule) => {
      const placement = mediaOf(rule);
      if (placement === null) {
        return;
      }
      if ('skip' in placement) {
        skipped.set(`${placement.skip}|${rule.selector}`, { selector: rule.selector, reason: placement.skip });
        return;
      }

      // Custom properties are compared through the properties that consume them —
      // their own values legitimately differ (the flag-off compile has none).
      const decls = rule.nodes.filter((node): node is postcss.Declaration => node.type === 'decl' && !node.prop.startsWith('--'));
      const props = decls.map((decl) => decl.prop);
      const customProps = referencedCustomProps(decls).filter((name) => declaredCustomProps.has(name));
      if (props.length === 0) {
        return;
      }

      selectorParser().astSync(rule.selector).each((branch) => {
        const selector = String(branch).trim();
        const key = `${placement.media ?? ''}|${selector}`;
        const existing = targets.get(key);
        if (existing) {
          props.forEach((prop) => existing.propSet.add(prop));
          customProps.forEach((name) => existing.customPropSet.add(name));
          return;
        }

        const { steps, pseudoElement } = splitIntoSteps(branch);
        if (steps.length === 0) {
          return;
        }
        targets.set(key, {
          id: targets.size,
          selector,
          media: placement.media,
          component: componentOf(branch),
          steps: withBemContext(steps),
          pseudoElement,
          verifySelector: toVerifySelector(branch),
          props: [],
          propSet: new Set(props),
          customProps: [],
          customPropSet: new Set(customProps)
        });
      });
    });
  }

  return {
    targets: [ ...targets.values() ].map(({ propSet, customPropSet, ...target }) => ({ ...target, props: [ ...propSet ], customProps: [ ...customPropSet ] })),
    skipped: [ ...skipped.values() ]
  };
};
