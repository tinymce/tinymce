import { Arr, Cell, Obj, Optional, Type } from '@ephox/katamari';

import Editor from '../api/Editor';
import { FormatEvent } from '../api/EventTypes';
import { EditorEvent } from '../api/util/EventDispatcher';
import * as NodeType from '../dom/NodeType';
import { FormatVars } from './FormatTypes';
import * as FormatUtils from './FormatUtils';
import * as MatchFormat from './MatchFormat';

export type FormatChangeCallback = (state: boolean, data: { node: Node; format: string; parents: Element[] }) => void;

export type RegisteredFormats = Record<string, CallbackGroup>;

export interface UnbindFormatChanged {
  unbind: () => void;
}

interface CallbackWithoutVars {
  readonly state: Cell<boolean>;
  readonly similar: boolean;
  readonly callbacks: FormatChangeCallback[];
}

interface CallbackWithVars {
  readonly state: Cell<boolean>;
  readonly similar: boolean | undefined;
  readonly vars: FormatVars;
  readonly callback: FormatChangeCallback;
}

interface CallbackGroup {
  // Batch all callbacks that don't have custom variables into one "similar=true" and one "similar=false" group
  readonly withSimilar: CallbackWithoutVars;
  readonly withoutSimilar: CallbackWithoutVars;
  // For callbacks with custom variables, handle everything separately
  readonly withVars: CallbackWithVars[];
}

const hasVars = (value: CallbackWithVars | CallbackWithoutVars): value is CallbackWithVars =>
  Obj.has(value as CallbackWithVars, 'vars');

const setup = (registeredFormatListeners: Cell<RegisteredFormats>, editor: Editor): void => {
  registeredFormatListeners.set({});

  editor.on('NodeChange', (e) => {
    updateAndFireChangeCallbacks(editor, e.element, registeredFormatListeners.get());
  });

  editor.on('FormatApply FormatRemove', (e: EditorEvent<FormatEvent>) => {
    const element = Optional.from(e.node)
      .map((nodeOrRange) => FormatUtils.isNode(nodeOrRange) ? nodeOrRange : nodeOrRange.startContainer)
      .bind((node) => NodeType.isElement(node) ? Optional.some(node) : Optional.from(node.parentElement))
      .getOrThunk(() => fallbackElement(editor));

    updateAndFireChangeCallbacks(editor, element, registeredFormatListeners.get());
  });
};

const fallbackElement = (editor: Editor): Element =>
  editor.selection.getStart();

const matchingNode = (editor: Editor, parents: Element[], format: string, similar?: boolean, vars?: FormatVars): Optional<Element> => {
  const isMatchingNode = (node: Element) => {
    const matchingFormat = editor.formatter.matchNode(node, format, vars ?? {}, similar);
    return !Type.isUndefined(matchingFormat);
  };
  const isUnableToMatch = (node: Element) => {
    if (MatchFormat.matchesUnInheritedFormatSelector(editor, node, format)) {
      return true;
    } else {
      if (!similar) {
        // If we want to find an exact match, then finding a similar match halfway up the parents tree is bad
        return Type.isNonNullable(editor.formatter.matchNode(node, format, vars, true));
      } else {
        return false;
      }
    }
  };
  return Arr.findUntil(parents, isMatchingNode, isUnableToMatch);
};

const getParents = (editor: Editor, elm?: Element): Element[] => {
  const element = elm ?? fallbackElement(editor);
  return Arr.filter(FormatUtils.getParents(editor.dom, element), (node): node is Element =>
    NodeType.isElement(node) && !NodeType.isBogus(node)
  );
};

const updateAndFireChangeCallbacks = (editor: Editor, elm: Element, registeredCallbacks: RegisteredFormats) => {
  // Ignore bogus nodes like the <a> tag created by moveStart()
  const parents = getParents(editor, elm);

  Obj.each(registeredCallbacks, (data, format) => {
    const runIfChanged = (spec: CallbackWithoutVars | CallbackWithVars) => {
      const match = matchingNode(editor, parents, format, spec.similar, hasVars(spec) ? spec.vars : undefined);
      const isSet = match.isSome();
      if (spec.state.get() !== isSet) {
        spec.state.set(isSet);
        const node = match.getOr(elm);
        if (hasVars(spec)) {
          spec.callback(isSet, { node, format, parents });
        } else {
          Arr.each(spec.callbacks, (callback) => callback(isSet, { node, format, parents }));
        }
      }
    };

    Arr.each([ data.withSimilar, data.withoutSimilar ], runIfChanged);
    Arr.each(data.withVars, runIfChanged);
  });
};

const addListeners = (
  editor: Editor,
  registeredFormatListeners: Cell<RegisteredFormats>,
  formats: string,
  callback: FormatChangeCallback,
  similar?: boolean,
  vars?: FormatVars
) => {
  const formatChangeItems = registeredFormatListeners.get();

  Arr.each(formats.split(','), (format) => {
    const group = Obj.get(formatChangeItems, format).getOrThunk(() => {
      const base: CallbackGroup = {
        withSimilar: {
          state: Cell<boolean>(false),
          similar: true,
          callbacks: []
        },
        withoutSimilar: {
          state: Cell<boolean>(false),
          similar: false,
          callbacks: []
        },
        withVars: []
      };

      formatChangeItems[format] = base;
      return base;
    });

    const getCurrent = () => {
      const parents = getParents(editor);
      return matchingNode(editor, parents, format, similar, vars).isSome();
    };
    if (Type.isUndefined(vars)) {
      const toAppendTo = similar ? group.withSimilar : group.withoutSimilar;
      toAppendTo.callbacks.push(callback);
      if (toAppendTo.callbacks.length === 1) {
        toAppendTo.state.set(getCurrent());
      }
    } else {
      group.withVars.push({
        state: Cell(getCurrent()),
        similar,
        vars,
        callback
      });
    }
  });

  registeredFormatListeners.set(formatChangeItems);
};

const removeListeners = (registeredFormatListeners: Cell<RegisteredFormats>, formats: string, callback: FormatChangeCallback) => {
  const formatChangeItems = registeredFormatListeners.get();

  Arr.each(formats.split(','), (format) => Obj.get(formatChangeItems, format).each((group) => {
    formatChangeItems[format] = {
      withSimilar: {
        ...group.withSimilar,
        callbacks: Arr.filter(group.withSimilar.callbacks, (cb) => cb !== callback),
      },
      withoutSimilar: {
        ...group.withoutSimilar,
        callbacks: Arr.filter(group.withoutSimilar.callbacks, (cb) => cb !== callback),
      },
      withVars: Arr.filter(group.withVars, (item) => item.callback !== callback),
    };
  }));

  registeredFormatListeners.set(formatChangeItems);
};

const formatChangedInternal = (
  editor: Editor,
  registeredFormatListeners: Cell<RegisteredFormats>,
  formats: string,
  callback: FormatChangeCallback,
  similar?: boolean,
  vars?: FormatVars
): UnbindFormatChanged => {
  addListeners(editor, registeredFormatListeners, formats, callback, similar, vars);

  return {
    unbind: () => removeListeners(registeredFormatListeners, formats, callback)
  };
};

export {
  setup,
  formatChangedInternal
};
