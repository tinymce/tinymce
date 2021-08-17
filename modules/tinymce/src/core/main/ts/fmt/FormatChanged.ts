/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Arr, Cell, Obj, Optional, Type } from '@ephox/katamari';

import Editor from '../api/Editor';
import { FormatEvent } from '../api/EventTypes';
import { EditorEvent } from '../api/util/EventDispatcher';
import * as NodeType from '../dom/NodeType';
import { FormatVars } from './FormatTypes';
import * as FormatUtils from './FormatUtils';
import * as MatchFormat from './MatchFormat';

export type FormatChangeCallback = (state: boolean, data: { node: Node; format: string; parents: any }) => void;

export type RegisteredFormats = Record<string, CallbackGroup>;

export interface UnbindFormatChanged {
  unbind: () => void;
}

interface CustomCallback {
  readonly state: Cell<boolean>;
  readonly similar: boolean;
  readonly vars: FormatVars;
  readonly callback: FormatChangeCallback;
}

interface CallbackGroup {
  // Bundle all callbacks with similar=true and unspecified vars
  readonly similarState: Cell<boolean>;
  readonly similarCallbacks: FormatChangeCallback[];
  // Also bundle all callbacks with similar=false and unspecified vars
  readonly similarFalseState: Cell<boolean>;
  readonly similarFalseCallbacks: FormatChangeCallback[];
  // Then for callbacks that have variables, handle everything separately
  readonly others: CustomCallback[];
}

const setup = (registeredFormatListeners: Cell<RegisteredFormats>, editor: Editor) => {
  registeredFormatListeners.set({});

  editor.on('NodeChange', (e) => {
    updateAndFireChangeCallbacks(editor, e.element, registeredFormatListeners.get());
  });

  editor.on('FormatApply FormatRemove', (e: EditorEvent<FormatEvent>) => {
    const element = editor.selection.getStart();
    updateAndFireChangeCallbacks(editor, element, registeredFormatListeners.get());
  });
};

const matchingNode = (editor: Editor, parents: Element[], format: string, similar: boolean, vars?: FormatVars): Optional<Element> => {
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
  const element = elm ?? editor.selection.getNode();
  return Arr.filter(FormatUtils.getParents(editor.dom, element), (node) =>
    NodeType.isElement(node) && !node.getAttribute('data-mce-bogus')
  );
};

const hasChanged = (state: Cell<boolean>, newState: boolean): boolean => {
  if (state.get() === newState) {
    return false;
  } else {
    state.set(newState);
    return true;
  }
};

const updateAndFireChangeCallbacks = (
  editor: Editor,
  elm: Element,
  registeredCallbacks: RegisteredFormats
) => {
  // Ignore bogus nodes like the <a> tag created by moveStart()
  const parents = getParents(editor, elm);

  Obj.each(registeredCallbacks, (data, format) => {
    Arr.each([
      { callbacks: data.similarCallbacks, state: data.similarState, similar: true },
      { callbacks: data.similarFalseCallbacks, state: data.similarFalseState, similar: false }
    ], (spec) => {
      if (spec.callbacks.length > 0) {
        const match = matchingNode(editor, parents, format, spec.similar);
        if (hasChanged(spec.state, match.isSome())) {
          const node = match.getOr(elm);
          Arr.each(spec.callbacks, (callback) => callback(match.isSome(), { node, format, parents }));
        }
      }
    });

    Arr.each(data.others, (item) => {
      const match = matchingNode(editor, parents, format, item.similar, item.vars);
      if (hasChanged(item.state, match.isSome())) {
        const node = match.getOr(elm);
        item.callback(match.isSome(), { node, format, parents });
      }
    });
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
        similarState: Cell(false),
        similarCallbacks: [],
        similarFalseState: Cell(false),
        similarFalseCallbacks: [],
        others: []
      };

      formatChangeItems[format] = base;
      return base;
    });

    const getCurrent = () => {
      const parents = getParents(editor);
      return matchingNode(editor, parents, format, similar, vars).isSome();
    };
    if (Type.isUndefined(vars)) {
      const callbacks = similar ? group.similarCallbacks : group.similarFalseCallbacks;
      callbacks.push(callback);
      if (callbacks.length === 1) {
        const state = similar ? group.similarState : group.similarFalseState;
        state.set(getCurrent());

      }
    } else {
      group.others.push({
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
      similarState: group.similarState,
      similarFalseState: group.similarFalseState,
      // Remove the callback, if we find it, from anywhere
      similarCallbacks: Arr.filter(group.similarCallbacks, (cb) => cb !== callback),
      similarFalseCallbacks: Arr.filter(group.similarFalseCallbacks, (cb) => cb !== callback),
      others: Arr.filter(group.others, (item) => item.callback !== callback),
    };
  }));

  registeredFormatListeners.set(formatChangeItems);
};

const formatChangedInternal = (
  editor: Editor,
  registeredFormatListeners: Cell<RegisteredFormats>,
  formats: string,
  callback: FormatChangeCallback,
  similar: boolean,
  vars: FormatVars
): UnbindFormatChanged => {
  if (registeredFormatListeners.get() === null) {
    setup(registeredFormatListeners, editor);
  }

  addListeners(editor, registeredFormatListeners, formats, callback, similar, vars);

  return {
    unbind: () => removeListeners(registeredFormatListeners, formats, callback)
  };
};

export {
  formatChangedInternal
};
