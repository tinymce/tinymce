import { Arr, Optional, Type } from '@ephox/katamari';
import { Compare, Css, Insert, PredicateExists, PredicateFilter, Remove, Replication, SugarElement, SugarNode, Traverse } from '@ephox/sugar';

import type DOMUtils from '../api/dom/DOMUtils';
import type Editor from '../api/Editor';
import type Formatter from '../api/Formatter';
import * as NodeStructureBookmark from '../bookmark/NodeStructureBookmark';

import * as ApplyElementFormat from './ApplyElementFormat';
import * as FormatTypes from './FormatTypes';
import * as MatchFormat from './MatchFormat';
import * as MergeFormats from './MergeFormats';
import * as RemoveFormat from './RemoveFormat';

interface WrapperData {
  readonly container: SugarElement<Element>;
  readonly innerWrapper: SugarElement<Element>;
  readonly outerWrappers: SugarElement<Element>[];
}

interface NormalizeRule {
  readonly format: string;
  readonly fontSizeAlteringFormats: readonly string[];
  readonly keepsColoredDecorations: boolean;
}

const subSupFormats = [ 'subscript', 'superscript' ] as const;
const fontSizeAlteringFormats = [ 'fontsize', ...subSupFormats ] as const;

const rules: NormalizeRule[] = [
  { format: 'strikethrough', fontSizeAlteringFormats, keepsColoredDecorations: false },
  { format: 'underline', fontSizeAlteringFormats: subSupFormats, keepsColoredDecorations: true }
];

const hasFormat = (formatter: Formatter, el: SugarElement<Node>, format: string): el is SugarElement<Element> =>
  Type.isNonNullable(formatter.matchNode(el.dom, format, {}, format === 'fontsize'));

const isFontSizeAlteringElement = (formatter: Formatter, rule: NormalizeRule, el: SugarElement<Node>): el is SugarElement<Element> =>
  Arr.exists(rule.fontSizeAlteringFormats, (format) => hasFormat(formatter, el, format));

const isTriggeredBy = (rule: NormalizeRule, appliedFormat: string) =>
  rule.format === appliedFormat || Arr.contains(rule.fontSizeAlteringFormats, appliedFormat);

const gatherWrapperData = (
  isRoot: (node: SugarElement<Node>) => boolean,
  scope: SugarElement<Element>,
  hasFormat: (el: SugarElement<Element>) => boolean,
  keepsDecoration: (el: SugarElement<Element>) => boolean,
  createFormatElement: (el: SugarElement<Element>) => SugarElement<Element>,
  removeFormatFromElement: (el: SugarElement<Element>) => Optional<SugarElement<Element>>
): Optional<WrapperData> => {
  const parents = Traverse.parents(scope, isRoot).filter(SugarNode.isElement);

  return Arr.findLastIndex(parents, hasFormat).map((index) => {
    const container = parents[index];
    const innerWrapper = createFormatElement(container);
    const outerWrappers = [
      ...removeFormatFromElement(Replication.shallow(container)).toArray(),
      ...Arr.bind(parents.slice(0, index), (wrapper) => {
        if (hasFormat(wrapper)) {
          // Stripping the live element would also strip the content that the split clones on either side of the scope
          return removeFormatFromElement(keepsDecoration(wrapper) ? Replication.shallow(wrapper) : wrapper).toArray();
        } else {
          return [ Replication.shallow(wrapper) ];
        }
      })
    ];

    return { container, innerWrapper, outerWrappers };
  });
};

const wrapChildrenInInnerWrapper = (
  target: SugarElement<Element>,
  wrapper: SugarElement<Element>,
  hasFormat: (el: SugarElement<Node>) => boolean,
  keepsDecoration: (el: SugarElement<Element>) => boolean,
  removeFormatFromElement: (el: SugarElement<Element>) => Optional<SugarElement<Element>>
) => {
  Arr.each(Traverse.children(target), (child) => {
    if (SugarNode.isElement(child) && hasFormat(child) && !keepsDecoration(child)) {
      if (removeFormatFromElement(child).isNone()) {
        Remove.unwrap(child);
      }
    }
  });

  Arr.each(Traverse.children(target), (child) => Insert.append(wrapper, child));

  Insert.prepend(target, wrapper);
};

const wrapInOuterWrappers = (target: SugarElement<Element>, wrappers: SugarElement<Element>[]) => {
  if (wrappers.length > 0) {
    const outermost = wrappers[wrappers.length - 1];
    Insert.before(target, outermost);

    const innerMost = Arr.foldl(wrappers.slice(0, wrappers.length - 1), (acc, wrapper) => {
      Insert.append(acc, wrapper);
      return wrapper;
    }, outermost);

    Insert.append(innerMost, target);
  }
};

const normalizeFontSizeElementsInternal = (
  domUtils: DOMUtils,
  fontSizeElements: SugarElement<Element>[],
  hasFormat: (el: SugarElement<Node>) => boolean,
  keepsDecoration: (el: SugarElement<Element>) => boolean,
  createFormatElement: (el: SugarElement<Element>) => SugarElement<Element>,
  removeFormatFromElement: (el: SugarElement<Element>) => Optional<SugarElement<Element>>
): void => {
  const isRoot = (el: SugarElement<Node>) => Compare.eq(SugarElement.fromDom(domUtils.getRoot()), el) || domUtils.isBlock(el.dom);

  Arr.each(fontSizeElements, (fontSizeElement) => {
    gatherWrapperData(
      isRoot,
      fontSizeElement,
      hasFormat,
      keepsDecoration,
      createFormatElement,
      removeFormatFromElement
    ).each(({ container, innerWrapper, outerWrappers }) => {
      domUtils.split(container.dom, fontSizeElement.dom);
      wrapChildrenInInnerWrapper(fontSizeElement, innerWrapper, hasFormat, keepsDecoration, removeFormatFromElement);
      wrapInOuterWrappers(fontSizeElement, outerWrappers);
    });
  });
};

const normalizeFontSizeElementsWithFormat = (
  editor: Editor,
  rule: NormalizeRule,
  fontSizeElements: SugarElement<Element>[]
): void => {
  const formatName = rule.format;
  const hasFormat = (el: SugarElement<Node>) => Type.isNonNullable(MatchFormat.matchNode(editor, el.dom, formatName));

  const keepsDecoration = (el: SugarElement<Element>) => rule.keepsColoredDecorations && Css.getRaw(el, 'color').isSome();

  const createFormatElement = (el: SugarElement<Element>) => {
    const newEl = SugarElement.fromTag(SugarNode.name(el));
    const format = MatchFormat.matchNode(editor, el.dom, formatName, {});

    if (Type.isNonNullable(format) && FormatTypes.isApplyFormat(format)) {
      ApplyElementFormat.setElementFormat(editor, newEl.dom, format);
    }

    return newEl;
  };

  const removeFormatFromElement = (el: SugarElement<Element>) => {
    const format = MatchFormat.matchNode(editor, el.dom, formatName, {});

    if (Type.isNonNullable(format)) {
      return RemoveFormat.removeFormatOnElement(editor, format, {}, el.dom).map(SugarElement.fromDom);
    } else {
      return Optional.some(el);
    }
  };

  normalizeFontSizeElementsInternal(editor.dom, fontSizeElements, hasFormat, keepsDecoration, createFormatElement, removeFormatFromElement);
};

// The wrappers are split and replaced by clones before ApplyFormat merges the decorations of their colored descendants
const mergeColoredDecorations = (editor: Editor, rule: NormalizeRule, wrappers: SugarElement<Element>[]): void =>
  Arr.each(wrappers, (wrapper) => {
    const format = MatchFormat.matchNode(editor, wrapper.dom, rule.format, {});

    if (Type.isNonNullable(format) && FormatTypes.isApplyFormat(format) && PredicateExists.descendant(wrapper, (el) => isFontSizeAlteringElement(editor.formatter, rule, el))) {
      MergeFormats.mergeTextDecorationsAndColor(editor.dom, format, {}, wrapper.dom);
    }
  });

const withBookmark = (editor: Editor, f: () => void): void => {
  const bookmark = NodeStructureBookmark.createBookmark(editor.selection.getRng());
  f();
  editor.selection.setRng(NodeStructureBookmark.resolveBookmark(bookmark));
};

const collectFontSizeElements = (formatter: Formatter, rule: NormalizeRule, wrappers: SugarElement<Element>[]) =>
  Arr.bind(wrappers, (wrapper) => {
    const fontSizeDescendants = PredicateFilter.descendants(wrapper, (el) => isFontSizeAlteringElement(formatter, rule, el));
    return isFontSizeAlteringElement(formatter, rule, wrapper) ? [ wrapper, ...fontSizeDescendants ] : fontSizeDescendants;
  });

export const normalizeFontSizeElementsAfterApply = (editor: Editor, appliedFormat: string, wrappers: SugarElement<Element>[]): void => {
  const collect = (rule: NormalizeRule) => collectFontSizeElements(editor.formatter, rule, wrappers);
  const rulesToRun = Arr.filter(rules, (rule) => isTriggeredBy(rule, appliedFormat) && collect(rule).length > 0);

  if (rulesToRun.length > 0) {
    withBookmark(editor, () => Arr.each(rulesToRun, (rule) => {
      if (rule.keepsColoredDecorations && rule.format === appliedFormat) {
        mergeColoredDecorations(editor, rule, wrappers);
      }

      normalizeFontSizeElementsWithFormat(editor, rule, collect(rule));
    }));
  }
};

export const normalizeElements = (editor: Editor, elements: SugarElement<Element>[]): void => {
  const collect = (rule: NormalizeRule) => Arr.filter(elements, (el) => isFontSizeAlteringElement(editor.formatter, rule, el));
  const rulesToRun = Arr.filter(rules, (rule) => collect(rule).length > 0);

  if (rulesToRun.length > 0) {
    withBookmark(editor, () => Arr.each(rulesToRun, (rule) => normalizeFontSizeElementsWithFormat(editor, rule, collect(rule))));
  }
};

